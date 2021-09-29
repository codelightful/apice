'use strict';

// A route can be defined to handle any unmatching path
Apice.router.register('404', (hash) => {
    Apice.errorHandler.render(Apice.router.target(), { message: `An invalid resource has been requested: ${hash}`});
}).asNotFound();

// A router may contain a reference to a fragment, when the route is triggered the fragment will be served in the
// route target.  The route target can be defined using the method Apice.route.target()
// A route also can be defined as the default route, the default route will be served when:
// 1) When there is no hash
// - or -
// 2) When a not found route is not defined
Apice.router.register('home', Apice.fragment('home')).asDefault();

// A fragment name can be provided instead of a fragment implementation
Apice.router.register('component/badge', 'badge');

// A router can contain a function with a custom implementation, the function will be invoked whenever the route is matched
Apice.router.register('component/toast', () => {
    Apice.fragment('toast').render(Apice.router.target(), true).then(() => {
        console.log('The toast fragment has been loaded by a route');
    }).catch((err) => {
        err.render(Apice.router.target());
    });
});
