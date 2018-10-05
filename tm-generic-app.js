/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
// import '../shared/my-icons.js';


window.MyAppGlobals = { rootPath: '/' };

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js', {
            scope: MyAppGlobals.rootPath
        });
    });
}

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(MyAppGlobals.rootPath);


// TODO: Rename MyApp to PolymerApp and generalise it, then make My app use the PolymerApp.
class GenericApp extends PolymerElement {
    static get template() {
        return html`
      <style>
        :host {
          --app-primary-color: #4285f4;
          --app-secondary-color: black;

          display: block;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
        }

        .drawer-list a.iron-selected {
          color: black;
          font-weight: bold;
        }
        
        .show-false {
            display:none;
        }
        
      </style>
      
      <script src="https://cdn.firebase.com/libs/firebaseui/3.4.1/firebaseui.js"></script>
      <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.4.1/firebaseui.css" />
    
      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <!--<template is="dom-if" if="[[_goodToGo(user, readyToGo)]]">-->
          <app-drawer-layout fullbleed="" narrow="{{narrow}}">
            <!-- Drawer content -->
            <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
              <app-toolbar>Menu</app-toolbar>
              <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
                <template is="dom-repeat" items="[[pages]]" as="page">
                    <a name="[[page.name]]" href="[[rootPath]][[page.name]]">[[page.title]]</a>
                </template>
              </iron-selector>
            </app-drawer>
    
            <!-- Main content -->
            <app-header-layout has-scrolling-region="">
    
              <app-header slot="header" condenses="" reveals="" effects="waterfall">
                <app-toolbar>
                  <paper-icon-button icon="my-icons:menu" drawer-toggle=""></paper-icon-button>
                  <div id="maintitle" main-title="">[[title]]</div>
                </app-toolbar>
              </app-header>
    
              <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
                <slot name="page"></slot>
                <my-view404 name="view404"></my-view404>
                
                
              </iron-pages>
            </app-header-layout>
          </app-drawer-layout>
       <!--</template>-->
       
       <!--<template is="dom-if" if="[[_showLogin(user,readyToGo)]]">-->
          <div id="login" class$="show-[[_showLogin(user,readyToGo)]]">
             <div id="auth"></div>
          </div>
       <!--</template>-->
    `;
    }

    static get properties() {
        return {
            title: {
                type: String,
                value: 'My New App'
            },
            page: {
                type: String,
                reflectToAttribute: true,
                observer: '_pageChanged'
            },
            pagesMap: {
                type: Object,
                value: {}
            },
            pages: {
                type: Array,
                value: [],
                observer: '_pagesChanged'
            },
            loginRequired: {
                type: Boolean,
                value: false
            },
            routeData: Object,
            subroute: Object,
            firebaseConfig: {
                type: Object,
                observer: '_firebaseConfigChanged'
            },
            firebase: {
                type: Object,
                value: null,
                notify: true
            },
            user: {
                type: Object,
                observer: '_userChanged',
                notify: true
            },
            config: {
                type: Object,
                value: {

                }
            }
        };
    }

    _showLogin(user, goodToGo) {
        return this._loginRequired() && goodToGo;
    }

    _loginRequired() {
        return (this.loginRequired && !this._loggedIn(this.user));
    }

    _goodToGo(user, readyToGo) {
        const goodToGo = (!this.loginRequired || this._loggedIn(user)) && readyToGo === true;
        return goodToGo;
    }
    _loggedIn(user) {
        return (user !== undefined && user !== null && user.uid !== undefined);
    }

    _userChanged(user) {
        console.log('User Changed: ', user);
    }

    _firebaseConfigChanged(firebaseConfig) {
        console.log('Firebase is loader');
        this.firebase = firebase;
        this.firebase.initializeApp(firebaseConfig);
        console.log('Firebase is initalised');

    }
    static get observers() {
        return [
            '_routePageChanged(routeData.page)'
        ];
    }

    ready() {
        super.ready();
        this.readyToGo = true;

        if (this._loginRequired()) {
            this._login();
        }

        console.log('-------: DRAWER: ', this.$.drawer);
    }

    _login() {
        console.log('Creating the login screen');

        const self = this;
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    console.log(authResult);
                    self.user = {
                        uid: authResult.user.uid,
                        name: authResult.user.displayName,
                        email: authResult.user.email
                    };

                    return false;
                },
                signInWithRedirect: function() {
                    return false;
                },
                signInSuccess: function(currentUser, credential, redirectUrl) {
                    console.log('Current User', currentUser);
                    return false;
                },
                uiShown: function() {
                    // The widget is rendered.
                    // Hide the loader.
                    // self.$.loader.style.display = 'none';
                }
            },
            // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
            signInFlow: 'popup',
            signInSuccessUrl: 'localhost:8081',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                //firebase.auth.GithubAuthProvider.PROVIDER_ID,
                //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '<your-tos-url>',
            // Privacy policy url.
            privacyPolicyUrl: '<your-privacy-policy-url>'
        };

        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        this.firebase.ui = ui;

        // The start method will wait until the DOM is loaded.
        console.log('Creating the login screen: ', ui);
        ui.start(this.$.auth, uiConfig);
    }

    _pagesChanged(pages) {
        const pagesMap = {};
        this.pages.forEach(function(page) {
            pagesMap[page.name] = page;
        });
        this.set('pagesMap', pagesMap);
    }

    _routePageChanged(page) {
        if (page) {
            this.page = (page in this.pagesMap ? page
                : (this.pages.length > 0 ? this.pages[0].name : "view404"));
        } else {
            this.page = 'view404';
        }

        if (this._goodToGo(this.user, this.readyToGo)) {
            // Close a non-persistent drawer when the page & route are changed.
            if (!this.$.drawer.persistent) {
                this.$.drawer.close();
            }
        }
    }

    _pageChanged(page) {
        if (page in this.pagesMap) {
            if (this.pagesMap[page].lazy) {
                const importName = './pages/my-' + page + '.js';
                import(importName);
            }
        } else {
            import('./pages/my-view404.js');
        }
    }
}

window.customElements.define('tm-generic-app', GenericApp);
