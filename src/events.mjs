const $module = {};
const $scope = {};
// placeholders to maintain references to event listeners and callbacks
$scope.events = {};
// contains all the callbacks registered to be executed once the ready status is reached
$scope.events.ready = {
    completed: false,
    listeners: []
};

$module.on = function(eventName, callback) {
    const eventHolder = $scope.events[eventName];
    if(!eventHolder) {
        throw new Error('alux.events.unknown_event[' + eventName + ']');
    } else if(typeof(callback) !== 'function') {
        throw new Error('alux.events.invalid_callback');
    } else if(eventHolder.completed) {
        callback();
    } else {
        eventHolder.listeners.push(callback);
    }
    return $module;
};

(function checkReadyState() {
    const onDocumentReady = () => {
        $scope.events.ready.completed = true;
        if($scope.events.ready.listeners.length > 0) {
            $scope.events.ready.listeners.map((handler) => {
                handler();
            })
        }
    };
    if (document.readyState === "complete") {
        onDocumentReady();
    } else if (typeof(document.addEventListener) === 'function') {
        document.addEventListener('DOMContentLoaded', onDocumentReady, false);
    } else if (typeof(document.attachEvent)  === 'function') {
        document.attachEvent("onreadystatechange", function () {
			if (document.readyState === "complete") {
				onDocumentReady();
			}
		});
    }
})();

export default $module;