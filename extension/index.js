'use strict';
const axios = require('axios');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider  } = require('twitch-auth');
const { DirectConnectionAdapter, EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-webhooks-ngrok');
const crypto = require("crypto");
const fs = require('fs');

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

module.exports = async function (nodecg) {
	const twitchSigningSecret = nodecg.bundleConfig.twitch.secret;

	const user = nodecg.bundleConfig.pseudo;
	const clientId = nodecg.bundleConfig.twitch.clientId;
	const clientSecret = nodecg.bundleConfig.twitch.clientSecret;
	const accessToken = nodecg.bundleConfig.twitch.accessToken;
	const userId = nodecg.bundleConfig.twitch.userId;

	let adapter = null;
	if (nodecg.bundleConfig.ssl && nodecg.bundleConfig.ssl.enabled) {
		adapter = new DirectConnectionAdapter({
			hostName: nodecg.bundleConfig.ssl.hostName,
			sslCert: {
				key: fs.readFileSync(nodecg.bundleConfig.ssl.keyPath, 'utf8'),
				cert: fs.readFileSync(nodecg.bundleConfig.ssl.certificatePath, 'utf8'),
			}
		});
	} else {
		adapter = new NgrokAdapter();
	}

	const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
	const apiClient = new ApiClient({ authProvider });

	const listener = new EventSubListener(apiClient, adapter, 'thisShouldBeARandomlyGeneratedFixedString');
	await listener.listen();

	//Old subscriptions handling.
	let currentSubscriptions = await axios.get(
		'https://api.twitch.tv/helix/eventsub/subscriptions',
		{
			headers: {
				'Authorization': 'Bearer ' + accessToken,
				'Client-Id': clientId
			}
		}
	);

	if (currentSubscriptions.data) {
		if (0 < currentSubscriptions.data.total) {
			nodecg.log.info(`${currentSubscriptions.data.total} subscriptions found. Attempt to unsubscribe.`);
			currentSubscriptions.data.data.forEach(function(sub){
				removeSubscription(sub.id);
			});
		}
	}

	async function removeSubscription(subId)
	{
		nodecg.log.info(`Trying to remove the subscription ${subId} ...`);
		let removeQuery = await axios.delete(
			'https://api.twitch.tv/helix/eventsub/subscriptions',
			{
				headers: {
					'Authorization': 'Bearer ' + accessToken,
					'Client-Id': clientId
				},
				params: {
					'id': subId
				}
			}
		);

		if ('' === removeQuery.data) {
			nodecg.log.info(`SUCCESS`);
		} else {
			nodecg.log.error(`ERROR`);
		}
	}

	//Démarrage du serveur socket.io
	server.listen(3100, () => {
		nodecg.log.info('listening on *:3100');
	});

	const verifyTwitchSignature = (req, res, buf, encoding) => {
		const messageId = req.header("Twitch-Eventsub-Message-Id");
		const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
		const messageSignature = req.header("Twitch-Eventsub-Message-Signature");
		const time = Math.floor(new Date().getTime() / 1000);
		console.log(`Message ${messageId} Signature: `, messageSignature);

		if (Math.abs(time - timestamp) > 600) {
			// needs to be < 10 minutes
			console.log(`Verification Failed: timestamp > 10 minutes. Message Id: ${messageId}.`);
			throw new Error("Ignore this request.");
		}

		if (!twitchSigningSecret) {
			console.log(`Twitch signing secret is empty.`);
			throw new Error("Twitch signing secret is empty.");
		}

		const computedSignature =
			"sha256=" +
			crypto
				.createHmac("sha256", twitchSigningSecret)
				.update(messageId + timestamp + buf)
				.digest("hex");
		console.log(`Message ${messageId} Computed Signature: `, computedSignature);

		if (messageSignature !== computedSignature) {
			throw new Error("Invalid signature.");
		} else {
			console.log("Verification successful");
		}
	};

	app.use(express.json({ verify: verifyTwitchSignature }));

	app.post("/webhooks/callback", async (req, res) => {
		const messageType = req.header("Twitch-Eventsub-Message-Type");
		if (messageType === "webhook_callback_verification") {
			console.log("Verifying Webhook");
			return res.status(200).send(req.body.challenge);
		}

		const { type } = req.body.subscription;
		const { event } = req.body;

		console.log(
			`Receiving ${type} request for ${event.broadcaster_user_name}: `,
			event
		);

		res.status(200).end();
	});

	io.on('connection', (socket) => {
		nodecg.log.info('djodjibot is now connected');
	});

	let eventListener = null;
	//Channel points handling.
	async function refreshListener() {
		if (eventListener) {
			nodecg.log.info(`Trying to refresh twitch events subscriptions.`);
			await eventListener.stop();
			await createListener();
		} else {
			nodecg.log.info(`Creating twitch events subscriptions.`);
			await createListener();
		}
	}

	const papaGrubCounter = nodecg.Replicant('papaGrub');
	async function createListener() {
		if ("Djodjino" === user) {
			eventListener = await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
				if ('Potion de chaos !!!' === e.rewardTitle) {
					nodecg.log.info(`CHAOS popped by ${e.userDisplayName}`);
					io.sockets.emit(
						'chaosPotion',
						{
							'user': e.userDisplayName
						}
					);
				} else if ('Disco Madness' === e.rewardTitle) {
					nodecg.log.info(`Event triggered : Disco madness by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'rainbow',
						10
					);
				} else if ('Eau' === e.rewardTitle) {
					nodecg.log.info(`Water overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#002CFF'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Water'
					);
					emitchangeGuild(e.userDisplayName, 'water');
				} else if ('Feu' === e.rewardTitle) {
					nodecg.log.info(`Fire overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#921616'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Fire'
					);
					emitchangeGuild(e.userDisplayName, 'fire');
				} else if ('Terre' === e.rewardTitle) {
					nodecg.log.info(`Earth overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#00FF78'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Earth'
					);
					emitchangeGuild(e.userDisplayName, 'earth');
				} else if ('Air' === e.rewardTitle) {
					nodecg.log.info(`Air overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#00dcff'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Air'
					);
					emitchangeGuild(e.userDisplayName, 'air');
				} else if ('Lumière' === e.rewardTitle) {
					nodecg.log.info(`Light overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#e0be62'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Light'
					);
					emitchangeGuild(e.userDisplayName, 'light');
				} else if ('Ténèbres' === e.rewardTitle) {
					nodecg.log.info(`Darkness overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#8A43CD'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Darkness'
					);
					emitchangeGuild(e.userDisplayName, 'darkness');
				} else if ('Poison' === e.rewardTitle) {
					nodecg.log.info(`Poison used by ${e.userDisplayName}`);
					io.sockets.emit(
						'poison',
						{
							'user': e.userDisplayName,
						}
					);
				} else if ('Régicide' === e.rewardTitle) {
					nodecg.log.info(`Régicide used by ${e.userDisplayName}`);
					io.sockets.emit(
						'kingSlayer',
						{
							'user': e.userDisplayName,
						}
					);
				} else if ('Défendre la royauté' === e.rewardTitle) {
					nodecg.log.info(`KingGuard used by ${e.userDisplayName}`);
					io.sockets.emit(
						'kingGuard',
						{
							'user': e.userDisplayName,
						}
					);
				}
			});
		} else if ("Twyn" === user) {
			eventListener = await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
				if ('Save a Grub!' === e.rewardTitle) {
					nodecg.log.info(`Grub popped by ${e.userDisplayName}`);
					if (!papaGrubCounter.value) {
						papaGrubCounter.value = 0;
					}
					let counter = papaGrubCounter.value + 1
					if (counter === 46) {
						nodecg.log.info(`PAPA GRUB !!! by ${e.userDisplayName}`);

						papaGrubCounter.value = 0;
						nodecg.sendMessage(
							'popBigItem'
						);
						io.sockets.emit(
							'papaGrub',
							{
								'user': e.userDisplayName,
							}
						);
					} else {
						papaGrubCounter.value = counter;
						nodecg.sendMessage(
							'popItem'
						);
						io.sockets.emit(
							'grub',
							{
								'user': e.userDisplayName,
								'total': counter
							}
						);
					}
				} else if ('Eau' === e.rewardTitle) {
					nodecg.log.info(`Water overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#15658e'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Water'
					);
					emitchangeGuild(e.userDisplayName, 'water');
				} else if ('Feu' === e.rewardTitle) {
					nodecg.log.info(`Fire overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#921616'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Fire'
					);
					emitchangeGuild(e.userDisplayName, 'fire');
				} else if ('Terre' === e.rewardTitle) {
					nodecg.log.info(`Earth overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#294f38'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Earth'
					);
					emitchangeGuild(e.userDisplayName, 'earth');
				} else if ('Air' === e.rewardTitle) {
					nodecg.log.info(`Air overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#c1c1c1'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Air'
					);
					emitchangeGuild(e.userDisplayName, 'air');
				} else if ('Lumière' === e.rewardTitle) {
					nodecg.log.info(`Light overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#e0be62'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Light'
					);
					emitchangeGuild(e.userDisplayName, 'light');
				} else if ('Ténèbres' === e.rewardTitle) {
					nodecg.log.info(`Darkness overlay by ${e.userDisplayName}`);
					nodecg.sendMessage(
						'swapColor',
						'#20104a'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Darkness'
					);
					emitchangeGuild(e.userDisplayName, 'darkness');
				} else if ('Poison' === e.rewardTitle) {
					nodecg.log.info(`Poison used by ${e.userDisplayName}`);
					io.sockets.emit(
						'poison',
						{
							'user': e.userDisplayName,
						}
					);
				} else if ('Régicide' === e.rewardTitle) {
					nodecg.log.info(`Régicide used by ${e.userDisplayName}`);
					io.sockets.emit(
						'kingSlayer',
						{
							'user': e.userDisplayName,
						}
					);
				} else if ('Défendre la royauté' === e.rewardTitle) {
					nodecg.log.info(`KingGuard used by ${e.userDisplayName}`);
					io.sockets.emit(
						'kingGuard',
						{
							'user': e.userDisplayName,
						}
					);
				}
			});
		}
	}

	//Refresh every hour.
	refreshListener();
	setInterval(await refreshListener, 3600000);

	function emitchangeGuild(user, element) {
		io.sockets.emit(
			'changeGuild',
			{
				'user': user,
				'guild': element,
			}
		);
	}
};
