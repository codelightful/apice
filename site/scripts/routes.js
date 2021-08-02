Alux.router.register('notFound', function() {
}).asDefault();

Alux.router.register('home', function() {
    Alux.fragment('navigation').serve('body').then(() => {
        console.log('El fragmento del layout');
    }).catch((err) => {
        err.render('body');
    });    
});

//Alux.router.register('home', Alux.fragment('navigation')).asDefault();