const $module = {};
const $scope = {};
$scope.styles = {};
$scope.styles['info'] = { title: 'Information', icon: '', color: {} }

function renderToast() {
    const style = arguments[0];
    const specs =  { title: null, message: null, icon: null, color: { border: null, background: null, text: null }};
    if(arguments.length === 2) {
        specs.message = arguments[1];
    } else if(arguments.length === 3) {
        specs.title = arguments[1];
        specs.message = arguments[2];
    }
    console.log(style, arguments);
}

$module.info = function() {
    renderToast('info', ...arguments);
}

export default $module;
