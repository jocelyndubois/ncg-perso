'use strict';
const axios = require('axios');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider  } = require('twitch-auth');
// const { StaticAuthProvider } = require('twitch-auth');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-webhooks-ngrok');


const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

module.exports = async function (nodecg) {
	const user = nodecg.bundleConfig.pseudo;
	const clientId = nodecg.bundleConfig.twitch.clientId;
	const clientSecret = nodecg.bundleConfig.twitch.clientSecret;
	const accessToken = nodecg.bundleConfig.twitch.accessToken;
	const userId = nodecg.bundleConfig.twitch.userId;

	const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
	const apiClient = new ApiClient({ authProvider });

	const listener = new EventSubListener(apiClient, new NgrokAdapter(), 'thisShouldBeARandomlyGeneratedFixedString');
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

	io.on('connection', (socket) => {
		nodecg.log.info('djodjibot is now connected');
	});

	let eventListener = null;
	//Channel points handling.
	if ("Djodjino" === user) {
		eventListener = await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
			if ('Disco Madness' === e.rewardTitle) {
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
			}
		});
	} else if ("Twyn" === user) {
		eventListener = await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
			if ('Save a Grub!' === e.rewardTitle) {
				nodecg.log.info(`Pop grub by ${e.userDisplayName}`);
				nodecg.sendMessage(
					'popItem'
				);
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
					'c1c1c1',
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
					'#e0be62'
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
			}
		});
	}

	//Refresh every hour.
	setInterval(await refreshListener, 3600000);

	async function refreshListener() {
		nodecg.log.info(`Trying to refresh twitch events subscriptions.`);
		await eventListener.suspend();
		await eventListener.start();
	}

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
