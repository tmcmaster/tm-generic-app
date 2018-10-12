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
import '@vaadin/vaadin-list-box/vaadin-list-box.js';
import {} from 'tm-firebase';
import '/node_modules/@polymer/iron-icon/iron-icon.js';
import '/node_modules/@polymer/iron-icons/iron-icons.js';

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
        
        app-drawer {
        -webkit-user-select: none;
            /* Chrome/Safari */
            -moz-user-select: none;
            /* Firefox */
            -ms-user-select: none;
            /* IE10+ */
        }
      </style>
      
      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

          <app-drawer-layout fullbleed="" narrow="{{narrow}}" force-narrow="[[fullscreen]]">
            <!-- Drawer content -->
            <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]" transition-duration="1000">
              <app-toolbar>Menu</app-toolbar>
              <tm-firebase class$="show-[[_loginRequired()]]" name="login" config="[[firebaseConfig]]" user="{{user}}"></tm-firebase>
              <iron-selector selected="[[page]]" attr-for-selected="name" class$="drawer-list show-[[_goodToGo(user,readyToGo)]]" role="navigation">
                <template is="dom-repeat" items="[[pages]]" as="page">
                    <a name="[[page.name]]" href="[[rootPath]][[page.name]]">[[page.title]]</a>
                </template>
              </iron-selector>
            </app-drawer>
    
            <!-- Main content -->
            <app-header-layout has-scrolling-region="">
    
              <app-header slot="header" condenses="" reveals="" effects="waterfall">
                <app-toolbar>
                  <paper-icon-button icon="menu" drawer-toggle=""></paper-icon-button>
                  <div id="maintitle" main-title="">[[title]]</div>
                </app-toolbar>
              </app-header>
    
              <iron-pages selected="[[page]]" attr-for-selected="name" role="main"> 
                <slot name="page"></slot>
                <my-view404 name="view404"></my-view404>
              </iron-pages>
            </app-header-layout>
          </app-drawer-layout>
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
                value:'view2',
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
            fullscreen: {
                type: Boolean,
                value: false
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

    static get observers() {
        return [
            '_routePageChanged(routeData.page)'
        ];
    }

    ready() {
        super.ready();
        this.set('readyToGo', true);
        if (this._loginRequired()) {
            this.set('page', 'splash');
            const self = this;
            setTimeout(function() {
                self.$.drawer.open();
            }, 2000);

        }
    }

    _loginRequired() {
        return (this.loginRequired && !this._loggedIn(this.user));
    }

    _goodToGo(user, readyToGo) {
        const goodToGo = (!this.loginRequired || this._loggedIn(user)) && this.readyToGo === true;
        return goodToGo;
    }

    _loggedIn(user) {
        const isLoggedIn = (user !== undefined && user !== null && user.uid !== undefined);
        console.log('Login Checked: ', isLoggedIn);
        return isLoggedIn;
    }
    _userChanged(user) {
        console.log('User Changed: ', user);
        if (user !== undefined && user.name !== undefined) {
            this.set('page', this.pages[0].name);
        }
    }

    _pagesChanged(pages) {
        const pagesMap = {};
        pagesMap['splash'] = {name:'splash',title:'Splash'};
        this.pages.forEach(function(page) {
            pagesMap[page.name] = page;
        });
        this.set('pagesMap', pagesMap);
    }

    _firebaseConfigChanged(firebaseConfig) {
        console.log("FirebaseConfig Changed: ", firebaseConfig);
    }

    _routePageChanged(page) {
        //const page = pagePath.substr(window.MyAppGlobals.rootPath.length);
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
        console.log('Page has changed: ' + page);
        if (this.narrow === true) {
            this.$.drawer.close();
        }

        this.dispatchEvent(new CustomEvent('page-changed', {detail: {page: page}}));
    }
}

window.customElements.define('tm-generic-app', GenericApp);
