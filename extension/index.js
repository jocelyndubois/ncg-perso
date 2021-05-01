'use strict';
const axios = require('axios');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider  } = require('twitch-auth');
// const { StaticAuthProvider } = require('twitch-auth');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-webhooks-ngrok');

module.exports = async function (nodecg) {
	const user = nodecg.bundleConfig.pseudo;



	const clientId = nodecg.bundleConfig.twitch.clientId;
	const clientSecret = nodecg.bundleConfig.twitch.clientSecret;
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
				'Authorization': 'Bearer 8eysjhtauf1u5dsk5fti81ximatjqo',
				'Client-Id': 's4q3q1ns3g51eiqve0jabgxedx8bq2'
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
					'Authorization': 'Bearer 8eysjhtauf1u5dsk5fti81ximatjqo',
					'Client-Id': 's4q3q1ns3g51eiqve0jabgxedx8bq2'
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

	//Channel points handling.
	if ("Djodjino" === user) {
		await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
			if ('Disco Madness' === e.rewardTitle) {
				nodecg.log.info(`Event triggered : Disco madness by ${e.userDisplayName}`);
				nodecg.sendMessage(
					'rainbow',
					10
				);
			} else if ('Eau' === e.rewardTitle) {
				nodecg.log.info('Water overlay');
				nodecg.sendMessage(
					'swapColor',
					'#00A7FF'
				);
			} else if ('Feu' === e.rewardTitle) {
				nodecg.log.info('Fire overlay');
				nodecg.sendMessage(
					'swapColor',
					'#FF0016'
				);
			} else if ('Terre' === e.rewardTitle) {
				nodecg.log.info('Earth overlay');
				nodecg.sendMessage(
					'swapColor',
					'#00FF78'
				);
			}
		});
	} else if ("Twyn" === user) {
		await listener.subscribeToChannelRedemptionAddEvents(userId, e => {
			if ('Save a Grub!' === e.rewardTitle) {
				nodecg.log.info('Pop grub');
				nodecg.sendMessage(
					'popItem'
				);
			}
		});
	}
};
