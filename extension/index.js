'use strict';
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const ioClient = require('socket.io-client');
const socket = ioClient.connect('http://82.65.73.118:3100');

module.exports = async function (nodecg) {
	const user = nodecg.bundleConfig.pseudo;

	//Démarrage du serveur socket.io
	server.listen(3200, () => {
		nodecg.log.info('listening on *:3200');
	});

	io.on('connection', (socket) => {
		nodecg.log.info('djodjibot is now connected');
	});

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
	socket.on(
		'redemption',
		function (infos) {
			let e = infos.event._data;

			if ("Djodjino" === user && "Djodjino" === infos.channel) {
				if ('Potion de chaos !!!' === e.reward.title) {
					nodecg.log.info(`CHAOS popped by ${e.user_name}`);
					io.sockets.emit(
						'chaosPotion',
						{
							'user': e.user_name
						}
					);
				} else if ('Disco Madness' === e.reward.title) {
					nodecg.log.info(`Event triggered : Disco madness by ${e.user_name}`);
					nodecg.sendMessage(
						'rainbow',
						10
					);
				} else if ('Eau' === e.reward.title) {
					nodecg.log.info(`Water overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#002CFF'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Water'
					);
					emitchangeGuild(e.user_name, 'water');
				} else if ('Feu' === e.reward.title) {
					nodecg.log.info(`Fire overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#921616'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Fire'
					);
					emitchangeGuild(e.user_name, 'fire');
				} else if ('Terre' === e.reward.title) {
					nodecg.log.info(`Earth overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#00FF78'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Earth'
					);
					emitchangeGuild(e.user_name, 'earth');
				} else if ('Air' === e.reward.title) {
					nodecg.log.info(`Air overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#00dcff'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Air'
					);
					emitchangeGuild(e.user_name, 'air');
				} else if ('Lumière' === e.reward.title) {
					nodecg.log.info(`Light overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#e0be62'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Light'
					);
					emitchangeGuild(e.user_name, 'light');
				} else if ('Ténèbres' === e.reward.title) {
					nodecg.log.info(`Darkness overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#8A43CD'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Darkness'
					);
					emitchangeGuild(e.user_name, 'darkness');
				} else if ('Poison' === e.reward.title) {
					nodecg.log.info(`Poison used by ${e.user_name}`);
					io.sockets.emit(
						'poison',
						{
							'user': e.user_name,
						}
					);
				} else if ('Régicide' === e.reward.title) {
					nodecg.log.info(`Régicide used by ${e.user_name}`);
					io.sockets.emit(
						'kingSlayer',
						{
							'user': e.user_name,
						}
					);
				} else if ('Défendre la royauté' === e.reward.title) {
					nodecg.log.info(`KingGuard used by ${e.user_name}`);
					io.sockets.emit(
						'kingGuard',
						{
							'user': e.user_name,
						}
					);
				}
			} else if ("Twyn" === user && "Twyn" === infos.channel) {
				if ('Save a Grub!' === e.reward.title) {
					nodecg.log.info(`Grub popped by ${e.user_name}`);
					if (!papaGrubCounter.value) {
						papaGrubCounter.value = 0;
					}
					let counter = papaGrubCounter.value + 1
					if (counter === 46) {
						nodecg.log.info(`PAPA GRUB !!! by ${e.user_name}`);

						papaGrubCounter.value = 0;
						nodecg.sendMessage(
							'popBigItem'
						);
						io.sockets.emit(
							'papaGrub',
							{
								'user': e.user_name,
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
								'user': e.user_name,
								'total': counter
							}
						);
					}
				} else if ('Eau' === e.reward.title) {
					nodecg.log.info(`Water overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#15658e'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Water'
					);
					emitchangeGuild(e.user_name, 'water');
				} else if ('Feu' === e.reward.title) {
					nodecg.log.info(`Fire overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#921616'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Fire'
					);
					emitchangeGuild(e.user_name, 'fire');
				} else if ('Terre' === e.reward.title) {
					nodecg.log.info(`Earth overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#294f38'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Earth'
					);
					emitchangeGuild(e.user_name, 'earth');
				} else if ('Air' === e.reward.title) {
					nodecg.log.info(`Air overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#c1c1c1'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Air'
					);
					emitchangeGuild(e.user_name, 'air');
				} else if ('Lumière' === e.reward.title) {
					nodecg.log.info(`Light overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#e0be62'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Light'
					);
					emitchangeGuild(e.user_name, 'light');
				} else if ('Ténèbres' === e.reward.title) {
					nodecg.log.info(`Darkness overlay by ${e.user_name}`);
					nodecg.sendMessage(
						'swapColor',
						'#20104a'
					);
					nodecg.sendMessage(
						'swapBackground',
						'Darkness'
					);
					emitchangeGuild(e.user_name, 'darkness');
				} else if ('Poison' === e.reward.title) {
					nodecg.log.info(`Poison used by ${e.user_name}`);
					io.sockets.emit(
						'poison',
						{
							'user': e.user_name,
						}
					);
				} else if ('Régicide' === e.reward.title) {
					nodecg.log.info(`Régicide used by ${e.user_name}`);
					io.sockets.emit(
						'kingSlayer',
						{
							'user': e.user_name,
						}
					);
				} else if ('Défendre la royauté' === e.reward.title) {
					nodecg.log.info(`KingGuard used by ${e.user_name}`);
					io.sockets.emit(
						'kingGuard',
						{
							'user': e.user_name,
						}
					);
				}
			}
		}
	);

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
