var await = global.sync.await;
var defer = global.sync.defer;
var defers = global.sync.defers;
var request = require('request');


exports.getAccessToken = function () {

    var gr = await(request({
        uri: "https://graph.facebook.com/oauth/access_token",
        qs: {
            client_id: global.FB.appId,
            client_secret: global.FB.appSecret,
            grant_type: 'client_credentials'
        }
    }, defers('response', 'body')));

    return gr.body.replace('access_token=', '');

};

exports.getAccessTokenAsync = function (callback) {

    request({
        uri: "https://graph.facebook.com/oauth/access_token",
        qs: {
            client_id: global.FB.clientID,
            client_secret: global.FB.clientSecret,
            grant_type: 'client_credentials'
        }
    }, function (response, body) {

        callback(null, body.body.replace('access_token=', ''));

    });


};