var Router = /** @class */ (function () {
    function Router() {
    }
    Router.init = function (params) {
        if (params === void 0) { params = {}; }
        this.run = (params.run !== void 0 ? params.run : true);
        if (this.listener !== null) {
            window.removeEventListener('popstate', this.listener);
            this.listener = null;
        }
        if (!this.run) {
            return this;
        }
        this.listener = window.addEventListener('popstate', function (evt) {
            this.checkRoute.call(this);
        }.bind(this));
        setTimeout(function () {
            this.checkRoute.call(this);
        }.bind(this), 0);
        return this;
    };
    Router.addRoute = function (name, url, cb) {
        var route = this.routes.find(function (r) { return r.name === name; });
        url = url.replace(/\//ig, '/');
        if (route === void 0) {
            this.routes.push({
                callback: cb,
                name: name.toString().toLowerCase(),
                url: url
            });
        }
        else {
            route.callback = cb;
            route.url = url;
        }
        return this;
    };
    Router.addRoutes = function (routes) {
        var _this = this;
        if (routes === void 0) { routes = []; }
        routes
            .forEach(function (route, routeIndex) {
            _this.addRoute(route.name, route.url, route.callback);
        });
        return this;
    };
    Router.removeRoute = function (name) {
        name = name.toString().toLowerCase();
        this.routes = this.routes
            .filter(function (route) {
            return route.name != name;
        });
        return this;
    };
    Router.checkRoute = function () {
        if (this.run !== true) {
            return this;
        }
        if (this.routes.length < 1) {
            return this;
        }
        var hash = window.location.hash.substr(1).replace(/\//ig, '/');
        var hashlist = hash.split('/').filter(function (h) { return h.length > 0; });
        var route = this.routes[0];
        var params;
        var _loop_1 = function (routeIndex) {
            var routeToTest = this_1.routes[routeIndex];
            var urlList = routeToTest.url.split('/').filter(function (h) { return h.length > 0; });
            if (urlList.length <= hashlist.length) {
                params = {};
                var approved_1 = true;
                urlList
                    .forEach(function (urlListElement, i) {
                    if (urlListElement[0] === ":") {
                        params[urlListElement.substr(1)] = hashlist[i];
                    }
                    else {
                        if (urlListElement.toLowerCase() != hashlist[i].toLowerCase()) {
                            approved_1 = false;
                        }
                    }
                });
                if (approved_1 === true) {
                    route = routeToTest;
                }
            }
        };
        var this_1 = this;
        for (var routeIndex = 0; routeIndex < this.routes.length; routeIndex++) {
            _loop_1(routeIndex);
        }
        this.scopeDestroyTasks
            .forEach(function (task) {
            task.cb();
        });
        this.scopeDestroyTasks = [];
        route.callback.call(this, params);
    };
    Router.onScopeDestroy = function (cb, id) {
        if (id === void 0) { id = "scopeKillTask_" + this.scopeDestroyTaskID++; }
        this.scopeDestroyTasks.push({
            cb: cb,
            id: id.toString()
        });
        return this;
    };
    Router.onScopeDestroyRemove = function (id) {
        this.scopeDestroyTasks = this.scopeDestroyTasks
            .filter(function (task) {
            return task.id !== id.toString();
        });
        return this;
    };
    Router.scopeDestroyTasks = [];
    Router.routes = [];
    Router.run = false;
    Router.listener = null;
    Router.scopeDestroyTaskID = 0;
    return Router;
}());
