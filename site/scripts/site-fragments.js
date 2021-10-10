'use strict';

// A fragment can be used with a controller name that will be invoked after the content is loaded
Apice.fragment.register('topbar', './site/fragments/site-topbar.html', 'topbar');

// demonstrates the registering of a fragment using a function as a callback that is executed after the fragment content is rendered
Apice.fragment.register('layout', './site/fragments/site-layout.html', () => {
    Apice.fragment('topbar').render('#topbarArea');
});

// A fragment does not require to have a controller
Apice.fragment.register('home', './site/fragments/site-home.html');

Apice.fragment.register('toast', './site/fragments/components/site-toast.html', 'toast');

Apice.fragment.register('badge', './site/fragments/components/site-badge.html');

Apice.fragment.register('box', './site/fragments/components/site-box.html', 'box');

Apice.fragment.register('short', './site/fragments/content-short.html');

Apice.fragment.register('long', './site/fragments/content-long.html');