# Dingo
A Discord/Twitch bot.

# Credentials Setup
Cloud Firestore requires the following:

`discord > credentials > [clientID, clientSecret, token]`

> https://discord.com/developers/applications/ID/information -> Client ID & Client Secret

> https://discord.com/developers/applications/ID/bot -> Token

`twitch > config > [callback]`
> This is the IP or domain linking to the server the bot is hosted on.

`twitch > credentials > [clientId, clientSecret, token]`
> https://dev.twitch.tv/console/apps/ID -> Client ID & Client Secret

> https://twitchapps.com/tokengen/ -> Token -- Requires the `chat:read chat:edit` scopes.  (https://dev.twitch.tv/docs/authentication#scopes)

(Partially optional) `twitch > data > USERNAME > credentials`

> This is the token from the user. If you choose to track a user's subscriptions, you need a token from them. You can track a user by setting the `channels` field in the `data` document. Which will auto generate the `USERNAME` collection the next time it's ran.

> https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=https%3A%2F%2Ftwitchapps.com%2Ftokengen%2F&response_type=token&scope=channel_subscriptions+bits%3Aread

> Replace CLIENT_ID in the link above and use the response token.
