'use strict';

// demonstrates the registering of a fragment using a function as a callback that is executed after the fragment content is rendered
Alux.fragment.register('layout', './site/fragments/layout.html', () => {
    Alux.fragment('navigation').serve('#navigationArea');
});

// A fragment can be used with a controller that will be invoked after the content is loaded
Alux.fragment.register('navigation', './site/fragments/navigation.html', 'navigation');

// A fragment does not require to have a controller
Alux.fragment.register('home', './site/fragments/home.html');

Alux.fragment.register('toast', './site/fragments/components/toast.html');

Alux.fragment.register('badge', './site/fragments/components/badge.html');