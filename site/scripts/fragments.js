// demonstrates the registering of a fragment using a function as a callback that is executed after the fragment content is rendered
Alux.fragment.register('layout', './site/fragments/layout.html', function() {
    Alux.fragment('navigation').serve('#navigationArea');
    Alux.fragment('home').serve('#contentArea');
});

// A fragment can be used with a controller that will be invoked after the content is loaded
Alux.fragment.register('navigation', './site/fragments/navigation.html', 'navigation');

// A fragment does not require to have a controller
Alux.fragment.register('home', './site/fragments/home.html');
