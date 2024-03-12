//
//  Action.js
//  VoyagerActionExtension
//
//  Created by Alexander Harding on 3/11/24.
//

var Action = function() {};

Action.prototype = {
    run: function(arguments) {
        arguments.completionFunction({ "url" : document.URL })
    },
    finalize: function(arguments) {
        var openingUrl = arguments["deeplink"]
        if (openingUrl) {
            document.location.href = openingUrl
        }
    }
};

var ExtensionPreprocessingJS = new Action
