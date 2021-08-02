// A route can be defined to handle any unmatching path
Alux.router.register('404', function(hash) {
    Alux.errorHandler.render(Alux.router.target(), { message: 'An invalid resource has been requested: ' + hash});
}).asNotFound();

// A router may contain a reference to a fragment, when the route is triggered the fragment will be served in the
// route target.  The route target can be defined using the method Alux.route.target()
// A route also can be defined as the default route, the default route will be served when:
// 1) When there is no hash
// - or -
// 2) When a not found route is not defined
Alux.router.register('home', Alux.fragment('home')).asDefault();

// A router can contain a function with a custom implementation, the function will be invoked whenever the route is matched
Alux.router.register('component/toast', function() {
    Alux.fragment('toast').serve(Alux.router.target(), true).then(() => {
        console.log('The toast fragment has been loaded by a route');
    }).catch((err) => {
        err.render(Alux.router.target());
    });
});
