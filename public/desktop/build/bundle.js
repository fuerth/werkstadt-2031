
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* src/desktop/App/Card.svelte generated by Svelte v3.50.1 */

    const file$a = "src/desktop/App/Card.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let div_data_categories_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[4]);
    			attr_dev(div, "class", div_class_value = "wsf-card " + /*classes*/ ctx[0].join(' ') + " svelte-1ojvldk");
    			attr_dev(div, "title", /*title*/ ctx[5]);
    			attr_dev(div, "data-id", /*ID*/ ctx[1]);
    			attr_dev(div, "data-length", /*length*/ ctx[3]);
    			attr_dev(div, "data-categories", div_data_categories_value = /*categories*/ ctx[2].join(','));
    			add_location(div, file$a, 41, 0, 1090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 16) set_data_dev(t, /*text*/ ctx[4]);

    			if (dirty & /*classes*/ 1 && div_class_value !== (div_class_value = "wsf-card " + /*classes*/ ctx[0].join(' ') + " svelte-1ojvldk")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*title*/ 32) {
    				attr_dev(div, "title", /*title*/ ctx[5]);
    			}

    			if (dirty & /*ID*/ 2) {
    				attr_dev(div, "data-id", /*ID*/ ctx[1]);
    			}

    			if (dirty & /*length*/ 8) {
    				attr_dev(div, "data-length", /*length*/ ctx[3]);
    			}

    			if (dirty & /*categories*/ 4 && div_data_categories_value !== (div_data_categories_value = /*categories*/ ctx[2].join(','))) {
    				attr_dev(div, "data-categories", div_data_categories_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { ID = null } = $$props;
    	let { categories = null } = $$props;
    	let { length = null } = $$props;
    	let { classes = null } = $$props;
    	let { gender = null } = $$props;
    	let { age = null } = $$props;
    	let { location = null } = $$props;
    	let { text = '' } = $$props;
    	let title;
    	const writable_props = ['ID', 'categories', 'length', 'classes', 'gender', 'age', 'location', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ID' in $$props) $$invalidate(1, ID = $$props.ID);
    		if ('categories' in $$props) $$invalidate(2, categories = $$props.categories);
    		if ('length' in $$props) $$invalidate(3, length = $$props.length);
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('gender' in $$props) $$invalidate(6, gender = $$props.gender);
    		if ('age' in $$props) $$invalidate(7, age = $$props.age);
    		if ('location' in $$props) $$invalidate(8, location = $$props.location);
    		if ('text' in $$props) $$invalidate(4, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		ID,
    		categories,
    		length,
    		classes,
    		gender,
    		age,
    		location,
    		text,
    		title
    	});

    	$$self.$inject_state = $$props => {
    		if ('ID' in $$props) $$invalidate(1, ID = $$props.ID);
    		if ('categories' in $$props) $$invalidate(2, categories = $$props.categories);
    		if ('length' in $$props) $$invalidate(3, length = $$props.length);
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('gender' in $$props) $$invalidate(6, gender = $$props.gender);
    		if ('age' in $$props) $$invalidate(7, age = $$props.age);
    		if ('location' in $$props) $$invalidate(8, location = $$props.location);
    		if ('text' in $$props) $$invalidate(4, text = $$props.text);
    		if ('title' in $$props) $$invalidate(5, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text, gender, age, location*/ 464) {
    			{
    				// tooltip on hover	
    				const titleText = `"${text}"`;

    				const titleGender = gender === 'm' ? 'Mann' : gender === 'w' ? 'Frau' : null;
    				const titleAge = age ? `(${age} Jahre)` : '';
    				const titleLocation = location ? `aus ${location}` : '';

    				$$invalidate(5, title = [
    					titleText,
    					[titleGender, titleAge, titleLocation].filter(Boolean).join(' ')
    				].join('\n'));

    				// classes
    				const textLength = text.length;

    				if (textLength <= 40) {
    					$$invalidate(0, classes = ['xxs', 'postit']);
    				} else if (textLength <= 75) {
    					$$invalidate(0, classes = ['xs', 'postit']);
    				} else if (textLength <= 100) {
    					$$invalidate(0, classes = ['s', 'postit']);
    				} else if (textLength <= 200) {
    					$$invalidate(0, classes = ['m', 'postit']);
    				} else if (textLength <= 300) {
    					$$invalidate(0, classes = ['l', 'postit']);
    				} else if (textLength <= 450) {
    					$$invalidate(0, classes = ['xl', 'postit']);
    				} else {
    					$$invalidate(0, classes = ['xxl', 'cardboard']);
    				}
    			}
    		}
    	};

    	return [classes, ID, categories, length, text, title, gender, age, location];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			ID: 1,
    			categories: 2,
    			length: 3,
    			classes: 0,
    			gender: 6,
    			age: 7,
    			location: 8,
    			text: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get ID() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ID(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get categories() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set categories(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get length() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set length(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gender() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gender(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get age() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set age(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    async function fetchJson(url) {
    	const result = await fetch(url);
    	const json = await result.json();
    	return json;
    }

    const statisticsStore = readable([], set => {
    	fetchJson('./desktop/statistics.json').then(set);
    });

    const categoriesStore = readable([], set => {
    	fetchJson('./desktop/categories.json').then(set);
    });

    const cardsStore = readable([], set => {
    	fetchJson('./desktop/entries.json').then(set);
    });

    const selectedMainCategoryStore = writable();
    const selectedSubCategoryStore = writable();

    /* src/desktop/App/Cards.svelte generated by Svelte v3.50.1 */
    const file$9 = "src/desktop/App/Cards.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (28:0) {:catch error}
    function create_catch_block(ctx) {
    	let div;
    	let t_value = /*error*/ ctx[8].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			set_style(div, "color", "red");
    			add_location(div, file$9, 28, 0, 772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cards*/ 1 && t_value !== (t_value = /*error*/ ctx[8].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(28:0) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {:then number}
    function create_then_block(ctx) {
    	let ul;
    	let current;
    	let each_value = /*cards*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "id", "cardsList");
    			attr_dev(ul, "class", "wsf-cards svelte-ef0j5a");
    			add_location(ul, file$9, 20, 0, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cards*/ 1) {
    				each_value = /*cards*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(20:0) {:then number}",
    		ctx
    	});

    	return block;
    }

    // (22:1) {#each cards as card}
    function create_each_block$4(ctx) {
    	let li;
    	let werkstadtcard;
    	let t;
    	let current;
    	const werkstadtcard_spread_levels = [/*card*/ ctx[5]];
    	let werkstadtcard_props = {};

    	for (let i = 0; i < werkstadtcard_spread_levels.length; i += 1) {
    		werkstadtcard_props = assign(werkstadtcard_props, werkstadtcard_spread_levels[i]);
    	}

    	werkstadtcard = new Card({
    			props: werkstadtcard_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(werkstadtcard.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-ef0j5a");
    			add_location(li, file$9, 22, 1, 700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(werkstadtcard, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const werkstadtcard_changes = (dirty & /*cards*/ 1)
    			? get_spread_update(werkstadtcard_spread_levels, [get_spread_object(/*card*/ ctx[5])])
    			: {};

    			werkstadtcard.$set(werkstadtcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(werkstadtcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(werkstadtcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(werkstadtcard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(22:1) {#each cards as card}",
    		ctx
    	});

    	return block;
    }

    // (18:14)  <div>...waiting</div> {:then number}
    function create_pending_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "...waiting";
    			add_location(div, file$9, 18, 0, 601);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(18:14)  <div>...waiting</div> {:then number}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t;
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 4,
    		error: 8,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*cards*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t = space();
    			await_block_anchor = empty();
    			info.block.c();
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file$9, 1, 1, 15);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file$9, 2, 1, 76);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=Reenie+Beanie&family=Shadows+Into+Light+Two&family=Square+Peg&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file$9, 3, 1, 149);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			insert_dev(target, t, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*cards*/ 1 && promise !== (promise = /*cards*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let cards;
    	let $cardsStore;
    	validate_store(cardsStore, 'cardsStore');
    	component_subscribe($$self, cardsStore, $$value => $$invalidate(3, $cardsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cards', slots, []);
    	let { mainCategory } = $$props;
    	let { subCategory } = $$props;
    	const writable_props = ['mainCategory', 'subCategory'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cards> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('mainCategory' in $$props) $$invalidate(1, mainCategory = $$props.mainCategory);
    		if ('subCategory' in $$props) $$invalidate(2, subCategory = $$props.subCategory);
    	};

    	$$self.$capture_state = () => ({
    		WerkstadtCard: Card,
    		cardsStore,
    		mainCategory,
    		subCategory,
    		cards,
    		$cardsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('mainCategory' in $$props) $$invalidate(1, mainCategory = $$props.mainCategory);
    		if ('subCategory' in $$props) $$invalidate(2, subCategory = $$props.subCategory);
    		if ('cards' in $$props) $$invalidate(0, cards = $$props.cards);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$cardsStore, mainCategory, subCategory*/ 14) {
    			$$invalidate(0, cards = $cardsStore.filter(card => card.categories.includes(`${mainCategory}.${subCategory}`)));
    		}
    	};

    	return [cards, mainCategory, subCategory, $cardsStore];
    }

    class Cards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { mainCategory: 1, subCategory: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cards",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mainCategory*/ ctx[1] === undefined && !('mainCategory' in props)) {
    			console.warn("<Cards> was created without expected prop 'mainCategory'");
    		}

    		if (/*subCategory*/ ctx[2] === undefined && !('subCategory' in props)) {
    			console.warn("<Cards> was created without expected prop 'subCategory'");
    		}
    	}

    	get mainCategory() {
    		throw new Error("<Cards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mainCategory(value) {
    		throw new Error("<Cards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subCategory() {
    		throw new Error("<Cards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subCategory(value) {
    		throw new Error("<Cards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/desktop/App/NavigationButton.svelte generated by Svelte v3.50.1 */
    const file$8 = "src/desktop/App/NavigationButton.svelte";

    function create_fragment$8(ctx) {
    	let li;
    	let h2;
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			h2 = element("h2");
    			t0 = text(/*name*/ ctx[3]);
    			t1 = space();
    			div = element("div");
    			t2 = text(/*count*/ ctx[2]);
    			attr_dev(h2, "class", "svelte-1336dkq");
    			add_location(h2, file$8, 24, 1, 459);
    			attr_dev(div, "class", "sub-item-count svelte-1336dkq");
    			add_location(div, file$8, 25, 1, 478);
    			attr_dev(li, "id", /*id*/ ctx[1]);
    			attr_dev(li, "class", li_class_value = "btn " + /*type*/ ctx[0] + " svelte-1336dkq");
    			attr_dev(li, "data-count", /*count*/ ctx[2]);
    			toggle_class(li, "selected", /*selected*/ ctx[4]);
    			add_location(li, file$8, 18, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h2);
    			append_dev(h2, t0);
    			append_dev(li, t1);
    			append_dev(li, div);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 8) set_data_dev(t0, /*name*/ ctx[3]);
    			if (dirty & /*count*/ 4) set_data_dev(t2, /*count*/ ctx[2]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(li, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*type*/ 1 && li_class_value !== (li_class_value = "btn " + /*type*/ ctx[0] + " svelte-1336dkq")) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*count*/ 4) {
    				attr_dev(li, "data-count", /*count*/ ctx[2]);
    			}

    			if (dirty & /*type, selected*/ 17) {
    				toggle_class(li, "selected", /*selected*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavigationButton', slots, []);
    	let { type = "main" } = $$props;
    	let { id } = $$props;
    	let { count } = $$props;
    	let { name } = $$props;
    	let { selected = true } = $$props;

    	function onClick() {
    		if (type === "main") {
    			selectedMainCategoryStore.set(id);
    		} else {
    			selectedSubCategoryStore.set(id);
    		}
    	}

    	const writable_props = ['type', 'id', 'count', 'name', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavigationButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('count' in $$props) $$invalidate(2, count = $$props.count);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		id,
    		count,
    		name,
    		selected,
    		selectedMainCategoryStore,
    		selectedSubCategoryStore,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('count' in $$props) $$invalidate(2, count = $$props.count);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, id, count, name, selected, onClick];
    }

    class NavigationButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			type: 0,
    			id: 1,
    			count: 2,
    			name: 3,
    			selected: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationButton",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<NavigationButton> was created without expected prop 'id'");
    		}

    		if (/*count*/ ctx[2] === undefined && !('count' in props)) {
    			console.warn("<NavigationButton> was created without expected prop 'count'");
    		}

    		if (/*name*/ ctx[3] === undefined && !('name' in props)) {
    			console.warn("<NavigationButton> was created without expected prop 'name'");
    		}
    	}

    	get type() {
    		throw new Error("<NavigationButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<NavigationButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<NavigationButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<NavigationButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<NavigationButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<NavigationButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<NavigationButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<NavigationButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<NavigationButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<NavigationButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/desktop/App/NavigationMain.svelte generated by Svelte v3.50.1 */
    const file$7 = "src/desktop/App/NavigationMain.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (19:1) {:else}
    function create_else_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$7, 19, 2, 485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(19:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#if $categoriesStore.length}
    function create_if_block$4(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$categoriesStore*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1y8qml7");
    			add_location(ul, file$7, 7, 2, 203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$categoriesStore, $selectedMainCategoryStore*/ 3) {
    				each_value = /*$categoriesStore*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(7:1) {#if $categoriesStore.length}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each $categoriesStore as mainCat}
    function create_each_block$3(ctx) {
    	let werkstadtnavigationbutton;
    	let current;

    	werkstadtnavigationbutton = new NavigationButton({
    			props: {
    				type: "main",
    				id: /*mainCat*/ ctx[2].id,
    				count: /*mainCat*/ ctx[2].count,
    				name: /*mainCat*/ ctx[2].name,
    				selected: /*$selectedMainCategoryStore*/ ctx[1] === /*mainCat*/ ctx[2].id
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(werkstadtnavigationbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(werkstadtnavigationbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const werkstadtnavigationbutton_changes = {};
    			if (dirty & /*$categoriesStore*/ 1) werkstadtnavigationbutton_changes.id = /*mainCat*/ ctx[2].id;
    			if (dirty & /*$categoriesStore*/ 1) werkstadtnavigationbutton_changes.count = /*mainCat*/ ctx[2].count;
    			if (dirty & /*$categoriesStore*/ 1) werkstadtnavigationbutton_changes.name = /*mainCat*/ ctx[2].name;
    			if (dirty & /*$selectedMainCategoryStore, $categoriesStore*/ 3) werkstadtnavigationbutton_changes.selected = /*$selectedMainCategoryStore*/ ctx[1] === /*mainCat*/ ctx[2].id;
    			werkstadtnavigationbutton.$set(werkstadtnavigationbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(werkstadtnavigationbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(werkstadtnavigationbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(werkstadtnavigationbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(9:2) {#each $categoriesStore as mainCat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let nav;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$categoriesStore*/ ctx[0].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if_block.c();
    			attr_dev(nav, "class", "svelte-1y8qml7");
    			add_location(nav, file$7, 5, 0, 164);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if_blocks[current_block_type_index].m(nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(nav, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $categoriesStore;
    	let $selectedMainCategoryStore;
    	validate_store(categoriesStore, 'categoriesStore');
    	component_subscribe($$self, categoriesStore, $$value => $$invalidate(0, $categoriesStore = $$value));
    	validate_store(selectedMainCategoryStore, 'selectedMainCategoryStore');
    	component_subscribe($$self, selectedMainCategoryStore, $$value => $$invalidate(1, $selectedMainCategoryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavigationMain', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavigationMain> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		WerkstadtNavigationButton: NavigationButton,
    		categoriesStore,
    		selectedMainCategoryStore,
    		$categoriesStore,
    		$selectedMainCategoryStore
    	});

    	return [$categoriesStore, $selectedMainCategoryStore];
    }

    class NavigationMain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationMain",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/desktop/App/NavigationSub.svelte generated by Svelte v3.50.1 */

    const file$6 = "src/desktop/App/NavigationSub.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (30:1) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$6, 30, 2, 834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(30:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:1) {#if $subCatsStore}
    function create_if_block$3(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$subCatsStore*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1kpwrwk");
    			add_location(ul, file$6, 18, 1, 563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$subCatsStore, $selectedSubCategoryStore*/ 3) {
    				each_value = /*$subCatsStore*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(18:1) {#if $subCatsStore}",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#each $subCatsStore as subCat}
    function create_each_block$2(ctx) {
    	let werkstadtnavigationbutton;
    	let current;

    	werkstadtnavigationbutton = new NavigationButton({
    			props: {
    				type: "sub",
    				id: /*subCat*/ ctx[3].id,
    				count: /*subCat*/ ctx[3].count,
    				name: /*subCat*/ ctx[3].name,
    				selected: /*$selectedSubCategoryStore*/ ctx[1] === /*subCat*/ ctx[3].id
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(werkstadtnavigationbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(werkstadtnavigationbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const werkstadtnavigationbutton_changes = {};
    			if (dirty & /*$subCatsStore*/ 1) werkstadtnavigationbutton_changes.id = /*subCat*/ ctx[3].id;
    			if (dirty & /*$subCatsStore*/ 1) werkstadtnavigationbutton_changes.count = /*subCat*/ ctx[3].count;
    			if (dirty & /*$subCatsStore*/ 1) werkstadtnavigationbutton_changes.name = /*subCat*/ ctx[3].name;
    			if (dirty & /*$selectedSubCategoryStore, $subCatsStore*/ 3) werkstadtnavigationbutton_changes.selected = /*$selectedSubCategoryStore*/ ctx[1] === /*subCat*/ ctx[3].id;
    			werkstadtnavigationbutton.$set(werkstadtnavigationbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(werkstadtnavigationbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(werkstadtnavigationbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(werkstadtnavigationbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(20:2) {#each $subCatsStore as subCat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let nav;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$subCatsStore*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if_block.c();
    			attr_dev(nav, "class", "svelte-1kpwrwk");
    			add_location(nav, file$6, 16, 0, 535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if_blocks[current_block_type_index].m(nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(nav, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $subCatsStore;
    	let $selectedSubCategoryStore;
    	validate_store(selectedSubCategoryStore, 'selectedSubCategoryStore');
    	component_subscribe($$self, selectedSubCategoryStore, $$value => $$invalidate(1, $selectedSubCategoryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavigationSub', slots, []);

    	let subCatsStore = derived([categoriesStore, selectedMainCategoryStore], ([categories, selectedMainCategory], set) => {
    		if (categories.length && selectedMainCategory) {
    			const mainCat = categories.find(cat => cat.id === selectedMainCategory);

    			if (mainCat) {
    				set(mainCat.sub);
    			}
    		}
    	});

    	validate_store(subCatsStore, 'subCatsStore');
    	component_subscribe($$self, subCatsStore, value => $$invalidate(0, $subCatsStore = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavigationSub> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		derived,
    		WerkstadtNavigationButton: NavigationButton,
    		categoriesStore,
    		selectedMainCategoryStore,
    		selectedSubCategoryStore,
    		subCatsStore,
    		$subCatsStore,
    		$selectedSubCategoryStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('subCatsStore' in $$props) $$invalidate(2, subCatsStore = $$props.subCatsStore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$subCatsStore, $selectedSubCategoryStore, subCatsStore];
    }

    class NavigationSub extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationSub",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/desktop/App/Footer.svelte generated by Svelte v3.50.1 */

    const file$5 = "src/desktop/App/Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;
    	let div;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "realisiert mit ❤️ von";
    			t1 = space();
    			a = element("a");
    			a.textContent = "fullstax";
    			attr_dev(div, "class", "svelte-tnkizv");
    			add_location(div, file$5, 1, 1, 28);
    			attr_dev(a, "href", "https://fullstax.de");
    			attr_dev(a, "class", "svelte-tnkizv");
    			add_location(a, file$5, 2, 1, 62);
    			attr_dev(footer, "class", "copyright svelte-tnkizv");
    			add_location(footer, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(footer, t1);
    			append_dev(footer, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/desktop/App/Header.svelte generated by Svelte v3.50.1 */

    const file$4 = "src/desktop/App/Header.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let section0;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let t3;
    	let section1;
    	let h2;
    	let t5;
    	let div;

    	const block = {
    		c: function create() {
    			header = element("header");
    			section0 = element("section");
    			t0 = text("Die");
    			br0 = element("br");
    			t1 = text("großen");
    			br1 = element("br");
    			t2 = text("Themen");
    			t3 = space();
    			section1 = element("section");
    			h2 = element("h2");
    			h2.textContent = "Was bewegt die Fürther:innen?";
    			t5 = space();
    			div = element("div");
    			div.textContent = "Ideen, Wünsche und Aregungen für eine lebenswertes Fürth 2031";
    			add_location(br0, file$4, 1, 29, 38);
    			add_location(br1, file$4, 1, 39, 48);
    			attr_dev(section0, "class", "minSize svelte-7bgmp");
    			add_location(section0, file$4, 1, 1, 10);
    			attr_dev(h2, "class", "svelte-7bgmp");
    			add_location(h2, file$4, 3, 2, 95);
    			attr_dev(div, "class", "subtitle svelte-7bgmp");
    			add_location(div, file$4, 4, 2, 136);
    			attr_dev(section1, "class", "grow svelte-7bgmp");
    			add_location(section1, file$4, 2, 1, 70);
    			attr_dev(header, "class", "svelte-7bgmp");
    			add_location(header, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, section0);
    			append_dev(section0, t0);
    			append_dev(section0, br0);
    			append_dev(section0, t1);
    			append_dev(section0, br1);
    			append_dev(section0, t2);
    			append_dev(header, t3);
    			append_dev(header, section1);
    			append_dev(section1, h2);
    			append_dev(section1, t5);
    			append_dev(section1, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/desktop/App/App.svelte generated by Svelte v3.50.1 */

    const { console: console_1$1 } = globals;

    const file$3 = "src/desktop/App/App.svelte";

    // (61:1) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "lade Daten...";
    			attr_dev(div, "class", "svelte-145jwkb");
    			add_location(div, file$3, 61, 1, 1687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(61:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#if $categoriesStore.length}
    function create_if_block$2(ctx) {
    	let main;
    	let aside;
    	let navigationmain;
    	let t0;
    	let werkstadtfooter;
    	let t1;
    	let article;
    	let header;
    	let navigationsub;
    	let t2;
    	let section;
    	let werkstadtcards;
    	let current;
    	navigationmain = new NavigationMain({ $$inline: true });
    	werkstadtfooter = new Footer({ $$inline: true });
    	navigationsub = new NavigationSub({ $$inline: true });

    	werkstadtcards = new Cards({
    			props: {
    				mainCategory: /*$selectedMainCategoryStore*/ ctx[2],
    				subCategory: /*$selectedSubCategoryStore*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			aside = element("aside");
    			create_component(navigationmain.$$.fragment);
    			t0 = space();
    			create_component(werkstadtfooter.$$.fragment);
    			t1 = space();
    			article = element("article");
    			header = element("header");
    			create_component(navigationsub.$$.fragment);
    			t2 = space();
    			section = element("section");
    			create_component(werkstadtcards.$$.fragment);
    			attr_dev(aside, "class", "svelte-145jwkb");
    			add_location(aside, file$3, 45, 2, 1310);
    			attr_dev(header, "class", "subCatHeader svelte-145jwkb");
    			add_location(header, file$3, 50, 3, 1389);
    			attr_dev(section, "id", "cardsScrollContainer");
    			attr_dev(section, "class", "svelte-145jwkb");
    			add_location(section, file$3, 53, 3, 1457);
    			attr_dev(article, "class", "svelte-145jwkb");
    			add_location(article, file$3, 49, 2, 1376);
    			attr_dev(main, "class", "svelte-145jwkb");
    			add_location(main, file$3, 44, 1, 1301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, aside);
    			mount_component(navigationmain, aside, null);
    			append_dev(aside, t0);
    			mount_component(werkstadtfooter, aside, null);
    			append_dev(main, t1);
    			append_dev(main, article);
    			append_dev(article, header);
    			mount_component(navigationsub, header, null);
    			append_dev(article, t2);
    			append_dev(article, section);
    			mount_component(werkstadtcards, section, null);
    			/*section_binding*/ ctx[4](section);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const werkstadtcards_changes = {};
    			if (dirty & /*$selectedMainCategoryStore*/ 4) werkstadtcards_changes.mainCategory = /*$selectedMainCategoryStore*/ ctx[2];
    			if (dirty & /*$selectedSubCategoryStore*/ 8) werkstadtcards_changes.subCategory = /*$selectedSubCategoryStore*/ ctx[3];
    			werkstadtcards.$set(werkstadtcards_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigationmain.$$.fragment, local);
    			transition_in(werkstadtfooter.$$.fragment, local);
    			transition_in(navigationsub.$$.fragment, local);
    			transition_in(werkstadtcards.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigationmain.$$.fragment, local);
    			transition_out(werkstadtfooter.$$.fragment, local);
    			transition_out(navigationsub.$$.fragment, local);
    			transition_out(werkstadtcards.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navigationmain);
    			destroy_component(werkstadtfooter);
    			destroy_component(navigationsub);
    			destroy_component(werkstadtcards);
    			/*section_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(44:1) {#if $categoriesStore.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let werkstadtheader;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	werkstadtheader = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$categoriesStore*/ ctx[1].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(werkstadtheader.$$.fragment);
    			t = space();
    			if_block.c();
    			attr_dev(div, "class", "werkstadt-container svelte-145jwkb");
    			add_location(div, file$3, 41, 0, 1214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(werkstadtheader, div, null);
    			append_dev(div, t);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(werkstadtheader.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(werkstadtheader.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(werkstadtheader);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $categoriesStore;
    	let $selectedMainCategoryStore;
    	let $selectedSubCategoryStore;
    	validate_store(categoriesStore, 'categoriesStore');
    	component_subscribe($$self, categoriesStore, $$value => $$invalidate(1, $categoriesStore = $$value));
    	validate_store(selectedMainCategoryStore, 'selectedMainCategoryStore');
    	component_subscribe($$self, selectedMainCategoryStore, $$value => $$invalidate(2, $selectedMainCategoryStore = $$value));
    	validate_store(selectedSubCategoryStore, 'selectedSubCategoryStore');
    	component_subscribe($$self, selectedSubCategoryStore, $$value => $$invalidate(3, $selectedSubCategoryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let cardsScrollContainer;

    	const categoriesStoreUnsubscribe = categoriesStore.subscribe(categories => {
    		if (categories.length) {
    			selectedMainCategoryStore.set(categories[0].id);
    		}
    	});

    	const dataStoreUnsubscribe = derived([categoriesStore, selectedMainCategoryStore], ([categories, selectedMainCat], set) => {
    		// select first sub-category
    		const mainCat = categories.find(category => category.id === selectedMainCat);

    		if (mainCat) {
    			const subCatId = mainCat.sub[0].id;
    			selectedSubCategoryStore.set(subCatId);
    		}

    		if (cardsScrollContainer) {
    			cardsScrollContainer.scrollTo(0, 0);
    		}
    	}).subscribe(value => {
    		console.log('dataStore', value);
    	});

    	onDestroy(() => {
    		categoriesStoreUnsubscribe();
    		dataStoreUnsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cardsScrollContainer = $$value;
    			$$invalidate(0, cardsScrollContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		derived,
    		WerkstadtCards: Cards,
    		NavigationMain,
    		NavigationSub,
    		WerkstadtFooter: Footer,
    		WerkstadtHeader: Header,
    		categoriesStore,
    		selectedMainCategoryStore,
    		selectedSubCategoryStore,
    		cardsScrollContainer,
    		categoriesStoreUnsubscribe,
    		dataStoreUnsubscribe,
    		$categoriesStore,
    		$selectedMainCategoryStore,
    		$selectedSubCategoryStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('cardsScrollContainer' in $$props) $$invalidate(0, cardsScrollContainer = $$props.cardsScrollContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cardsScrollContainer,
    		$categoriesStore,
    		$selectedMainCategoryStore,
    		$selectedSubCategoryStore,
    		section_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/desktop/Statistics/BarChart.svelte generated by Svelte v3.50.1 */

    const file$2 = "src/desktop/Statistics/BarChart.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (41:1) {#if title}
    function create_if_block_2(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*title*/ ctx[3]);
    			attr_dev(h3, "class", "wsf-barchart__title svelte-1v77q49");
    			set_style(h3, "background-color", /*color*/ ctx[2]);
    			add_location(h3, file$2, 41, 1, 938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 8) set_data_dev(t, /*title*/ ctx[3]);

    			if (dirty & /*color*/ 4) {
    				set_style(h3, "background-color", /*color*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(41:1) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (51:3) {#if !bars || !bars.length }
    function create_if_block_1$1(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("lade Daten...");
    			attr_dev(text_1, "x", text_1_x_value = /*width*/ ctx[0] / 2);
    			attr_dev(text_1, "y", text_1_y_value = /*height*/ ctx[1] / 2);
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "text-anchor", "middle");
    			set_style(text_1, "fill", /*color*/ ctx[2], false);
    			add_location(text_1, file$2, 51, 3, 1173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 1 && text_1_x_value !== (text_1_x_value = /*width*/ ctx[0] / 2)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*height*/ 2 && text_1_y_value !== (text_1_y_value = /*height*/ ctx[1] / 2)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*color*/ 4) {
    				set_style(text_1, "fill", /*color*/ ctx[2], false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(51:3) {#if !bars || !bars.length }",
    		ctx
    	});

    	return block;
    }

    // (61:3) {#each bars as bar, index}
    function create_each_block_2(ctx) {
    	let rect;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_height_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", rect_x_value = /*marginLeft*/ ctx[15] + /*index*/ ctx[23] * /*barWidth*/ ctx[8] + /*index*/ ctx[23] * /*barSpacing*/ ctx[11]);
    			attr_dev(rect, "y", rect_y_value = /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] - /*bar*/ ctx[21].value / /*maxValue*/ ctx[12] * /*canvasHeight*/ ctx[13]);
    			attr_dev(rect, "width", /*barWidth*/ ctx[8]);
    			attr_dev(rect, "height", rect_height_value = /*bar*/ ctx[21].value / /*maxValue*/ ctx[12] * /*canvasHeight*/ ctx[13]);
    			attr_dev(rect, "class", "svelte-1v77q49");
    			set_style(rect, "fill", /*color*/ ctx[2], false);
    			add_location(rect, file$2, 61, 3, 1381);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*barWidth, barSpacing*/ 2304 && rect_x_value !== (rect_x_value = /*marginLeft*/ ctx[15] + /*index*/ ctx[23] * /*barWidth*/ ctx[8] + /*index*/ ctx[23] * /*barSpacing*/ ctx[11])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*canvasHeight, bars, maxValue*/ 12800 && rect_y_value !== (rect_y_value = /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] - /*bar*/ ctx[21].value / /*maxValue*/ ctx[12] * /*canvasHeight*/ ctx[13])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*barWidth*/ 256) {
    				attr_dev(rect, "width", /*barWidth*/ ctx[8]);
    			}

    			if (dirty & /*bars, maxValue, canvasHeight*/ 12800 && rect_height_value !== (rect_height_value = /*bar*/ ctx[21].value / /*maxValue*/ ctx[12] * /*canvasHeight*/ ctx[13])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (dirty & /*color*/ 4) {
    				set_style(rect, "fill", /*color*/ ctx[2], false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(61:3) {#each bars as bar, index}",
    		ctx
    	});

    	return block;
    }

    // (72:3) {#each bars as bar, index}
    function create_each_block_1$1(ctx) {
    	let text_1;
    	let t_value = /*bar*/ ctx[21].label + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_dominant_baseline_value;
    	let text_1_text_anchor_value;
    	let text_1_writing_mode_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", text_1_x_value = /*marginLeft*/ ctx[15] + /*index*/ ctx[23] * /*barWidth*/ ctx[8] + /*barWidth*/ ctx[8] / 2 + /*index*/ ctx[23] * /*barSpacing*/ ctx[11]);

    			attr_dev(text_1, "y", text_1_y_value = !/*xVertical*/ ctx[4] && /*barCount*/ ctx[7] > 3 && /*index*/ ctx[23] % 2
    			? /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] + /*fontSize*/ ctx[5] * 1.75
    			: /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] + /*fontSize*/ ctx[5] * .75);

    			attr_dev(text_1, "dominant-baseline", text_1_dominant_baseline_value = /*xVertical*/ ctx[4] ? 'start' : 'middle');
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*xVertical*/ ctx[4] ? 'start' : 'middle');
    			attr_dev(text_1, "writing-mode", text_1_writing_mode_value = /*xVertical*/ ctx[4] ? 'tb' : 'lr');
    			set_style(text_1, "fill", /*color*/ ctx[2], false);
    			set_style(text_1, "font-size", /*fontSize*/ ctx[5] + 'px', false);
    			set_style(text_1, "font-weight", `bold`, false);
    			add_location(text_1, file$2, 72, 3, 1694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bars*/ 512 && t_value !== (t_value = /*bar*/ ctx[21].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*barWidth, barSpacing*/ 2304 && text_1_x_value !== (text_1_x_value = /*marginLeft*/ ctx[15] + /*index*/ ctx[23] * /*barWidth*/ ctx[8] + /*barWidth*/ ctx[8] / 2 + /*index*/ ctx[23] * /*barSpacing*/ ctx[11])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*xVertical, barCount, canvasHeight, fontSize*/ 8368 && text_1_y_value !== (text_1_y_value = !/*xVertical*/ ctx[4] && /*barCount*/ ctx[7] > 3 && /*index*/ ctx[23] % 2
    			? /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] + /*fontSize*/ ctx[5] * 1.75
    			: /*marginTop*/ ctx[14] + /*canvasHeight*/ ctx[13] + /*fontSize*/ ctx[5] * .75)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*xVertical*/ 16 && text_1_dominant_baseline_value !== (text_1_dominant_baseline_value = /*xVertical*/ ctx[4] ? 'start' : 'middle')) {
    				attr_dev(text_1, "dominant-baseline", text_1_dominant_baseline_value);
    			}

    			if (dirty & /*xVertical*/ 16 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*xVertical*/ ctx[4] ? 'start' : 'middle')) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*xVertical*/ 16 && text_1_writing_mode_value !== (text_1_writing_mode_value = /*xVertical*/ ctx[4] ? 'tb' : 'lr')) {
    				attr_dev(text_1, "writing-mode", text_1_writing_mode_value);
    			}

    			if (dirty & /*color*/ 4) {
    				set_style(text_1, "fill", /*color*/ ctx[2], false);
    			}

    			if (dirty & /*fontSize*/ 32) {
    				set_style(text_1, "font-size", /*fontSize*/ ctx[5] + 'px', false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(72:3) {#each bars as bar, index}",
    		ctx
    	});

    	return block;
    }

    // (91:3) {#if subtitle}
    function create_if_block$1(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(/*subtitle*/ ctx[6]);
    			attr_dev(text_1, "x", text_1_x_value = /*width*/ ctx[0] / 2);
    			attr_dev(text_1, "y", text_1_y_value = /*marginTop*/ ctx[14] + /*chartHeight*/ ctx[10] + /*fontSize*/ ctx[5]);
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "text-anchor", "middle");
    			set_style(text_1, "fill", /*color*/ ctx[2], false);
    			add_location(text_1, file$2, 91, 3, 2245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subtitle*/ 64) set_data_dev(t, /*subtitle*/ ctx[6]);

    			if (dirty & /*width*/ 1 && text_1_x_value !== (text_1_x_value = /*width*/ ctx[0] / 2)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*chartHeight, fontSize*/ 1056 && text_1_y_value !== (text_1_y_value = /*marginTop*/ ctx[14] + /*chartHeight*/ ctx[10] + /*fontSize*/ ctx[5])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*color*/ 4) {
    				set_style(text_1, "fill", /*color*/ ctx[2], false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(91:3) {#if subtitle}",
    		ctx
    	});

    	return block;
    }

    // (110:5) {#each bars as bar, index}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*bar*/ ctx[21].label + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*bar*/ ctx[21].value + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(td0, file$2, 111, 6, 2639);
    			add_location(td1, file$2, 112, 6, 2666);
    			add_location(tr, file$2, 110, 5, 2628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bars*/ 512 && t0_value !== (t0_value = /*bar*/ ctx[21].label + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*bars*/ 512 && t2_value !== (t2_value = /*bar*/ ctx[21].value + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(110:5) {#each bars as bar, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let figure;
    	let svg;
    	let if_block1_anchor;
    	let each0_anchor;
    	let each1_anchor;
    	let svg_viewBox_value;
    	let t1;
    	let figcaption;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t2_value = (/*title*/ ctx[3] || "Key") + "";
    	let t2;
    	let t3;
    	let th1;
    	let t5;
    	let tbody;
    	let if_block0 = /*title*/ ctx[3] && create_if_block_2(ctx);
    	let if_block1 = (!/*bars*/ ctx[9] || !/*bars*/ ctx[9].length) && create_if_block_1$1(ctx);
    	let each_value_2 = /*bars*/ ctx[9];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*bars*/ ctx[9];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block2 = /*subtitle*/ ctx[6] && create_if_block$1(ctx);
    	let each_value = /*bars*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			figure = element("figure");
    			svg = svg_element("svg");
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each1_anchor = empty();
    			if (if_block2) if_block2.c();
    			t1 = space();
    			figcaption = element("figcaption");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			t2 = text(t2_value);
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Anzahl";
    			t5 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "class", "wsf-barchart__chart svelte-1v77q49");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[0] + " " + /*height*/ ctx[1]);
    			add_location(svg, file$2, 45, 2, 1036);
    			add_location(th0, file$2, 104, 6, 2507);
    			add_location(th1, file$2, 105, 6, 2539);
    			add_location(tr, file$2, 103, 5, 2496);
    			add_location(thead, file$2, 102, 4, 2483);
    			add_location(tbody, file$2, 108, 4, 2583);
    			attr_dev(table, "border", "1");
    			add_location(table, file$2, 101, 3, 2460);
    			attr_dev(figcaption, "class", "sr-only");
    			add_location(figcaption, file$2, 100, 2, 2427);
    			add_location(figure, file$2, 44, 1, 1025);
    			attr_dev(div, "class", "wsf-barchart svelte-1v77q49");
    			add_location(div, file$2, 39, 0, 897);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, figure);
    			append_dev(figure, svg);
    			if (if_block1) if_block1.m(svg, null);
    			append_dev(svg, if_block1_anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(svg, null);
    			}

    			append_dev(svg, each0_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg, null);
    			}

    			append_dev(svg, each1_anchor);
    			if (if_block2) if_block2.m(svg, null);
    			append_dev(figure, t1);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(th0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, th1);
    			append_dev(table, t5);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*bars*/ ctx[9] || !/*bars*/ ctx[9].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(svg, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*marginLeft, barWidth, barSpacing, marginTop, canvasHeight, bars, maxValue, color*/ 64260) {
    				each_value_2 = /*bars*/ ctx[9];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(svg, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*marginLeft, barWidth, barSpacing, xVertical, barCount, marginTop, canvasHeight, fontSize, color, bars*/ 60340) {
    				each_value_1 = /*bars*/ ctx[9];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg, each1_anchor);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (/*subtitle*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(svg, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*width, height*/ 3 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[0] + " " + /*height*/ ctx[1])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*title*/ 8 && t2_value !== (t2_value = (/*title*/ ctx[3] || "Key") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*bars*/ 512) {
    				each_value = /*bars*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let chartWidth;
    	let chartHeight;
    	let labelsHeight;
    	let canvasHeight;
    	let barCount;
    	let bars;
    	let maxValue;
    	let barWidth;
    	let barSpacing;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BarChart', slots, []);
    	let { data = [] } = $$props;
    	let { width = 320 } = $$props;
    	let { height = 320 } = $$props;
    	let { color = "rgb(0, 0, 255)" } = $$props;
    	let { title = null } = $$props;
    	let { xVertical = false } = $$props;
    	let { fontSize = Math.abs(height * 0.06) } = $$props;
    	let { subtitle = null } = $$props;
    	const marginTop = height * 0.1;
    	const marginBottom = xVertical ? height * 0.3 : height * 0.1;
    	const marginRight = width * 0.15;
    	const marginLeft = width * 0.15;

    	const writable_props = [
    		'data',
    		'width',
    		'height',
    		'color',
    		'title',
    		'xVertical',
    		'fontSize',
    		'subtitle'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BarChart> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(16, data = $$props.data);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('xVertical' in $$props) $$invalidate(4, xVertical = $$props.xVertical);
    		if ('fontSize' in $$props) $$invalidate(5, fontSize = $$props.fontSize);
    		if ('subtitle' in $$props) $$invalidate(6, subtitle = $$props.subtitle);
    	};

    	$$self.$capture_state = () => ({
    		data,
    		width,
    		height,
    		color,
    		title,
    		xVertical,
    		fontSize,
    		subtitle,
    		marginTop,
    		marginBottom,
    		marginRight,
    		marginLeft,
    		barCount,
    		barWidth,
    		chartWidth,
    		barSpacing,
    		bars,
    		maxValue,
    		labelsHeight,
    		chartHeight,
    		canvasHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(16, data = $$props.data);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('xVertical' in $$props) $$invalidate(4, xVertical = $$props.xVertical);
    		if ('fontSize' in $$props) $$invalidate(5, fontSize = $$props.fontSize);
    		if ('subtitle' in $$props) $$invalidate(6, subtitle = $$props.subtitle);
    		if ('barCount' in $$props) $$invalidate(7, barCount = $$props.barCount);
    		if ('barWidth' in $$props) $$invalidate(8, barWidth = $$props.barWidth);
    		if ('chartWidth' in $$props) $$invalidate(17, chartWidth = $$props.chartWidth);
    		if ('barSpacing' in $$props) $$invalidate(11, barSpacing = $$props.barSpacing);
    		if ('bars' in $$props) $$invalidate(9, bars = $$props.bars);
    		if ('maxValue' in $$props) $$invalidate(12, maxValue = $$props.maxValue);
    		if ('labelsHeight' in $$props) $$invalidate(18, labelsHeight = $$props.labelsHeight);
    		if ('chartHeight' in $$props) $$invalidate(10, chartHeight = $$props.chartHeight);
    		if ('canvasHeight' in $$props) $$invalidate(13, canvasHeight = $$props.canvasHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 1) {
    			$$invalidate(17, chartWidth = width - marginLeft - marginRight);
    		}

    		if ($$self.$$.dirty & /*height*/ 2) {
    			$$invalidate(10, chartHeight = height - marginTop - marginBottom);
    		}

    		if ($$self.$$.dirty & /*fontSize*/ 32) {
    			$$invalidate(18, labelsHeight = fontSize * 2);
    		}

    		if ($$self.$$.dirty & /*chartHeight, labelsHeight*/ 263168) {
    			$$invalidate(13, canvasHeight = chartHeight - labelsHeight);
    		}

    		if ($$self.$$.dirty & /*data*/ 65536) {
    			$$invalidate(7, barCount = data.length);
    		}

    		if ($$self.$$.dirty & /*data*/ 65536) {
    			$$invalidate(9, bars = data.map(entry => {
    				return {
    					label: `${entry.key}`,
    					value: entry.value
    				};
    			}));
    		}

    		if ($$self.$$.dirty & /*bars*/ 512) {
    			$$invalidate(12, maxValue = Math.max(...bars.map(bar => bar.value)));
    		}

    		if ($$self.$$.dirty & /*chartWidth, barCount*/ 131200) {
    			$$invalidate(8, barWidth = chartWidth / barCount * 0.65);
    		}

    		if ($$self.$$.dirty & /*chartWidth, barWidth, barCount*/ 131456) {
    			$$invalidate(11, barSpacing = (chartWidth - barWidth * barCount) / (barCount - 1));
    		}
    	};

    	return [
    		width,
    		height,
    		color,
    		title,
    		xVertical,
    		fontSize,
    		subtitle,
    		barCount,
    		barWidth,
    		bars,
    		chartHeight,
    		barSpacing,
    		maxValue,
    		canvasHeight,
    		marginTop,
    		marginLeft,
    		data,
    		chartWidth,
    		labelsHeight
    	];
    }

    class BarChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			data: 16,
    			width: 0,
    			height: 1,
    			color: 2,
    			title: 3,
    			xVertical: 4,
    			fontSize: 5,
    			subtitle: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BarChart",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get data() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xVertical() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xVertical(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<BarChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<BarChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/desktop/Statistics/DonatChart.svelte generated by Svelte v3.50.1 */

    const file$1 = "src/desktop/Statistics/DonatChart.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (178:1) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "lade Daten...";
    			add_location(p, file$1, 178, 1, 4477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(178:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:1) {#if data && data.length}
    function create_if_block(ctx) {
    	let figure;
    	let svg;
    	let each0_anchor;
    	let t0;
    	let figcaption;
    	let table;
    	let tr;
    	let th0;
    	let th1;
    	let t3;
    	let each_value_1 = /*arcs*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*subtitle*/ ctx[4] && create_if_block_1(ctx);
    	let each_value = /*data*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each0_anchor = empty();
    			if (if_block) if_block.c();
    			t0 = space();
    			figcaption = element("figcaption");
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Key";
    			th1 = element("th");
    			th1.textContent = "Value";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[10]);
    			add_location(svg, file$1, 86, 2, 2225);
    			add_location(th0, file$1, 167, 5, 4275);
    			add_location(th1, file$1, 167, 17, 4287);
    			add_location(tr, file$1, 166, 4, 4265);
    			attr_dev(table, "border", "1");
    			add_location(table, file$1, 165, 3, 4244);
    			attr_dev(figcaption, "class", "sr-only");
    			add_location(figcaption, file$1, 164, 2, 4212);
    			add_location(figure, file$1, 85, 1, 2214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, svg);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg, null);
    			}

    			append_dev(svg, each0_anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(figure, t0);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, table);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, th1);
    			append_dev(table, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arcs, centerX, titleDistance, width, height, fontSize, radius*/ 971) {
    				each_value_1 = /*arcs*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (/*subtitle*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*viewBox*/ 1024) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[10]);
    			}

    			if (dirty & /*data*/ 4) {
    				each_value = /*data*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(85:1) {#if data && data.length}",
    		ctx
    	});

    	return block;
    }

    // (88:3) {#each arcs as arc}
    function create_each_block_1(ctx) {
    	let path;
    	let path_d_value;
    	let path_stroke_value;
    	let path_stroke_opacity_value;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let circle_fill_value;
    	let circle_fill_opacity_value;
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_x__value_1;
    	let line_y__value_1;
    	let line_stroke_value;
    	let line_stroke_opacity_value;
    	let line_stroke_width_value;
    	let foreignObject0;
    	let p0;
    	let t0_value = /*arc*/ ctx[21].title + "";
    	let t0;
    	let p0_style_value;
    	let foreignObject0_x_value;
    	let foreignObject0_y_value;
    	let foreignObject0_width_value;
    	let foreignObject0_height_value;
    	let foreignObject1;
    	let p1;
    	let t1_value = /*arc*/ ctx[21].subTitle + "";
    	let t1;
    	let p1_style_value;
    	let foreignObject1_x_value;
    	let foreignObject1_y_value;
    	let foreignObject1_width_value;
    	let foreignObject1_height_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			circle = svg_element("circle");
    			line = svg_element("line");
    			foreignObject0 = svg_element("foreignObject");
    			p0 = document.createElementNS("http://www.w3.org/1999/xhtml", "p");
    			t0 = text(t0_value);
    			foreignObject1 = svg_element("foreignObject");
    			p1 = document.createElementNS("http://www.w3.org/1999/xhtml", "p");
    			t1 = text(t1_value);
    			attr_dev(path, "d", path_d_value = /*arc*/ ctx[21].d);
    			attr_dev(path, "stroke", path_stroke_value = /*arc*/ ctx[21].color);
    			attr_dev(path, "stroke-opacity", path_stroke_opacity_value = /*arc*/ ctx[21].opacity);
    			attr_dev(path, "stroke-width", "30");
    			attr_dev(path, "stroke-linecap", "butt");
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "class", "svelte-1m39huv");
    			add_location(path, file$1, 88, 3, 2295);
    			attr_dev(circle, "cx", circle_cx_value = /*arc*/ ctx[21].x);
    			attr_dev(circle, "cy", circle_cy_value = /*arc*/ ctx[21].y);
    			attr_dev(circle, "r", circle_r_value = /*radius*/ ctx[6] * 0.03);
    			attr_dev(circle, "fill", circle_fill_value = /*arc*/ ctx[21].color);
    			attr_dev(circle, "fill-opacity", circle_fill_opacity_value = /*arc*/ ctx[21].opacity);
    			attr_dev(circle, "stroke-width", "1");
    			attr_dev(circle, "stroke", "none");
    			add_location(circle, file$1, 96, 3, 2445);

    			attr_dev(line, "x1", line_x__value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*radius*/ ctx[6] * 0.03
    			: /*arc*/ ctx[21].x - /*radius*/ ctx[6] * 0.03);

    			attr_dev(line, "y1", line_y__value = /*arc*/ ctx[21].y);

    			attr_dev(line, "x2", line_x__value_1 = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9] - 10
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] + 10);

    			attr_dev(line, "y2", line_y__value_1 = /*arc*/ ctx[21].y);
    			attr_dev(line, "stroke", line_stroke_value = /*arc*/ ctx[21].color);
    			attr_dev(line, "stroke-opacity", line_stroke_opacity_value = /*arc*/ ctx[21].opacity);
    			attr_dev(line, "stroke-width", line_stroke_width_value = /*radius*/ ctx[6] * 0.02);
    			attr_dev(line, "stroke-linecap", "round");
    			add_location(line, file$1, 105, 3, 2606);
    			attr_dev(p0, "xmlns", "http://www.w3.org/1999/xhtml");

    			attr_dev(p0, "style", p0_style_value = [
    				`color: ${/*arc*/ ctx[21].color}`,
    				`opacity: ${/*arc*/ ctx[21].opacity}`,
    				`font-size: ${/*fontSize*/ ctx[3]}px`,
    				`line-height: ${/*fontSize*/ ctx[3]}px`,
    				`text-align: ${/*arc*/ ctx[21].x > /*centerX*/ ctx[7]
				? 'left'
				: 'right'}`
    			].join(';'));

    			add_location(p0, file$1, 122, 4, 3129);

    			attr_dev(foreignObject0, "x", foreignObject0_x_value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9]
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] - /*width*/ ctx[0] * 0.2);

    			attr_dev(foreignObject0, "y", foreignObject0_y_value = /*arc*/ ctx[21].y - /*height*/ ctx[1] * 0.05 + /*fontSize*/ ctx[3] * 0.5);
    			attr_dev(foreignObject0, "width", foreignObject0_width_value = /*width*/ ctx[0] * 0.2);
    			attr_dev(foreignObject0, "height", foreignObject0_height_value = /*height*/ ctx[1] * 0.2);
    			add_location(foreignObject0, file$1, 117, 3, 2935);
    			attr_dev(p1, "xmlns", "http://www.w3.org/1999/xhtml");

    			attr_dev(p1, "style", p1_style_value = [
    				`color: ${/*arc*/ ctx[21].color}`,
    				`opacity: ${/*arc*/ ctx[21].opacity}`,
    				`font-size: ${/*fontSize*/ ctx[3] * 0.4}px`,
    				`line-height: ${/*fontSize*/ ctx[3] * 0.5}px`,
    				`text-align: ${/*arc*/ ctx[21].x > /*centerX*/ ctx[7]
				? 'left'
				: 'right'}`
    			].join(';'));

    			add_location(p1, file$1, 140, 4, 3660);

    			attr_dev(foreignObject1, "x", foreignObject1_x_value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9]
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] - /*width*/ ctx[0] * 0.2);

    			attr_dev(foreignObject1, "y", foreignObject1_y_value = /*arc*/ ctx[21].y - /*height*/ ctx[1] * 0.05 + /*fontSize*/ ctx[3] * 1.5);
    			attr_dev(foreignObject1, "width", foreignObject1_width_value = /*width*/ ctx[0] * 0.2);
    			attr_dev(foreignObject1, "height", foreignObject1_height_value = /*height*/ ctx[1] * 0.2);
    			add_location(foreignObject1, file$1, 135, 3, 3466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    			insert_dev(target, circle, anchor);
    			insert_dev(target, line, anchor);
    			insert_dev(target, foreignObject0, anchor);
    			append_dev(foreignObject0, p0);
    			append_dev(p0, t0);
    			insert_dev(target, foreignObject1, anchor);
    			append_dev(foreignObject1, p1);
    			append_dev(p1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arcs*/ 256 && path_d_value !== (path_d_value = /*arc*/ ctx[21].d)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*arcs*/ 256 && path_stroke_value !== (path_stroke_value = /*arc*/ ctx[21].color)) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty & /*arcs*/ 256 && path_stroke_opacity_value !== (path_stroke_opacity_value = /*arc*/ ctx[21].opacity)) {
    				attr_dev(path, "stroke-opacity", path_stroke_opacity_value);
    			}

    			if (dirty & /*arcs*/ 256 && circle_cx_value !== (circle_cx_value = /*arc*/ ctx[21].x)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*arcs*/ 256 && circle_cy_value !== (circle_cy_value = /*arc*/ ctx[21].y)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*radius*/ 64 && circle_r_value !== (circle_r_value = /*radius*/ ctx[6] * 0.03)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*arcs*/ 256 && circle_fill_value !== (circle_fill_value = /*arc*/ ctx[21].color)) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}

    			if (dirty & /*arcs*/ 256 && circle_fill_opacity_value !== (circle_fill_opacity_value = /*arc*/ ctx[21].opacity)) {
    				attr_dev(circle, "fill-opacity", circle_fill_opacity_value);
    			}

    			if (dirty & /*arcs, centerX, radius*/ 448 && line_x__value !== (line_x__value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*radius*/ ctx[6] * 0.03
    			: /*arc*/ ctx[21].x - /*radius*/ ctx[6] * 0.03)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*arcs*/ 256 && line_y__value !== (line_y__value = /*arc*/ ctx[21].y)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*arcs, centerX, titleDistance*/ 896 && line_x__value_1 !== (line_x__value_1 = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9] - 10
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] + 10)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*arcs*/ 256 && line_y__value_1 !== (line_y__value_1 = /*arc*/ ctx[21].y)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*arcs*/ 256 && line_stroke_value !== (line_stroke_value = /*arc*/ ctx[21].color)) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*arcs*/ 256 && line_stroke_opacity_value !== (line_stroke_opacity_value = /*arc*/ ctx[21].opacity)) {
    				attr_dev(line, "stroke-opacity", line_stroke_opacity_value);
    			}

    			if (dirty & /*radius*/ 64 && line_stroke_width_value !== (line_stroke_width_value = /*radius*/ ctx[6] * 0.02)) {
    				attr_dev(line, "stroke-width", line_stroke_width_value);
    			}

    			if (dirty & /*arcs*/ 256 && t0_value !== (t0_value = /*arc*/ ctx[21].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*arcs, fontSize, centerX*/ 392 && p0_style_value !== (p0_style_value = [
    				`color: ${/*arc*/ ctx[21].color}`,
    				`opacity: ${/*arc*/ ctx[21].opacity}`,
    				`font-size: ${/*fontSize*/ ctx[3]}px`,
    				`line-height: ${/*fontSize*/ ctx[3]}px`,
    				`text-align: ${/*arc*/ ctx[21].x > /*centerX*/ ctx[7]
				? 'left'
				: 'right'}`
    			].join(';'))) {
    				attr_dev(p0, "style", p0_style_value);
    			}

    			if (dirty & /*arcs, centerX, titleDistance, width*/ 897 && foreignObject0_x_value !== (foreignObject0_x_value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9]
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] - /*width*/ ctx[0] * 0.2)) {
    				attr_dev(foreignObject0, "x", foreignObject0_x_value);
    			}

    			if (dirty & /*arcs, height, fontSize*/ 266 && foreignObject0_y_value !== (foreignObject0_y_value = /*arc*/ ctx[21].y - /*height*/ ctx[1] * 0.05 + /*fontSize*/ ctx[3] * 0.5)) {
    				attr_dev(foreignObject0, "y", foreignObject0_y_value);
    			}

    			if (dirty & /*width*/ 1 && foreignObject0_width_value !== (foreignObject0_width_value = /*width*/ ctx[0] * 0.2)) {
    				attr_dev(foreignObject0, "width", foreignObject0_width_value);
    			}

    			if (dirty & /*height*/ 2 && foreignObject0_height_value !== (foreignObject0_height_value = /*height*/ ctx[1] * 0.2)) {
    				attr_dev(foreignObject0, "height", foreignObject0_height_value);
    			}

    			if (dirty & /*arcs*/ 256 && t1_value !== (t1_value = /*arc*/ ctx[21].subTitle + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*arcs, fontSize, centerX*/ 392 && p1_style_value !== (p1_style_value = [
    				`color: ${/*arc*/ ctx[21].color}`,
    				`opacity: ${/*arc*/ ctx[21].opacity}`,
    				`font-size: ${/*fontSize*/ ctx[3] * 0.4}px`,
    				`line-height: ${/*fontSize*/ ctx[3] * 0.5}px`,
    				`text-align: ${/*arc*/ ctx[21].x > /*centerX*/ ctx[7]
				? 'left'
				: 'right'}`
    			].join(';'))) {
    				attr_dev(p1, "style", p1_style_value);
    			}

    			if (dirty & /*arcs, centerX, titleDistance, width*/ 897 && foreignObject1_x_value !== (foreignObject1_x_value = /*arc*/ ctx[21].x > /*centerX*/ ctx[7]
    			? /*arc*/ ctx[21].x + /*titleDistance*/ ctx[9]
    			: /*arc*/ ctx[21].x - /*titleDistance*/ ctx[9] - /*width*/ ctx[0] * 0.2)) {
    				attr_dev(foreignObject1, "x", foreignObject1_x_value);
    			}

    			if (dirty & /*arcs, height, fontSize*/ 266 && foreignObject1_y_value !== (foreignObject1_y_value = /*arc*/ ctx[21].y - /*height*/ ctx[1] * 0.05 + /*fontSize*/ ctx[3] * 1.5)) {
    				attr_dev(foreignObject1, "y", foreignObject1_y_value);
    			}

    			if (dirty & /*width*/ 1 && foreignObject1_width_value !== (foreignObject1_width_value = /*width*/ ctx[0] * 0.2)) {
    				attr_dev(foreignObject1, "width", foreignObject1_width_value);
    			}

    			if (dirty & /*height*/ 2 && foreignObject1_height_value !== (foreignObject1_height_value = /*height*/ ctx[1] * 0.2)) {
    				attr_dev(foreignObject1, "height", foreignObject1_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			if (detaching) detach_dev(circle);
    			if (detaching) detach_dev(line);
    			if (detaching) detach_dev(foreignObject0);
    			if (detaching) detach_dev(foreignObject1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(88:3) {#each arcs as arc}",
    		ctx
    	});

    	return block;
    }

    // (154:3) {#if subtitle}
    function create_if_block_1(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(/*subtitle*/ ctx[4]);
    			attr_dev(text_1, "x", text_1_x_value = /*width*/ ctx[0] / 2);
    			attr_dev(text_1, "y", text_1_y_value = /*height*/ ctx[1] - /*fontSize*/ ctx[3]);
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "text-anchor", "middle");
    			set_style(text_1, "fill", /*color*/ ctx[5], false);
    			set_style(text_1, "font-weight", `normal`, false);
    			add_location(text_1, file$1, 154, 3, 4014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subtitle*/ 16) set_data_dev(t, /*subtitle*/ ctx[4]);

    			if (dirty & /*width*/ 1 && text_1_x_value !== (text_1_x_value = /*width*/ ctx[0] / 2)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*height, fontSize*/ 10 && text_1_y_value !== (text_1_y_value = /*height*/ ctx[1] - /*fontSize*/ ctx[3])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*color*/ 32) {
    				set_style(text_1, "fill", /*color*/ ctx[5], false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(154:3) {#if subtitle}",
    		ctx
    	});

    	return block;
    }

    // (170:4) {#each data as entry}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*entry*/ ctx[18].key + "";
    	let t0;
    	let td1;
    	let t1_value = /*entry*/ ctx[18].value.toFixed(2) + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			add_location(td0, file$1, 171, 5, 4352);
    			add_location(td1, file$1, 171, 25, 4372);
    			add_location(tr, file$1, 170, 4, 4342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, td1);
    			append_dev(td1, t1);
    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 4 && t0_value !== (t0_value = /*entry*/ ctx[18].key + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 4 && t1_value !== (t1_value = /*entry*/ ctx[18].value.toFixed(2) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(170:4) {#each data as entry}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[2] && /*data*/ ctx[2].length) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "wsf-donatchart svelte-1m39huv");
    			add_location(div, file$1, 83, 0, 2157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const opacityMin = 0.4;

    function instance$1($$self, $$props, $$invalidate) {
    	let centerX;
    	let centerY;
    	let viewBox;
    	let radius;
    	let radiusDistance;
    	let titleDistance;
    	let maxValue;
    	let arcs;
    	let spacing;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DonatChart', slots, []);
    	let { width = 960 } = $$props;
    	let { height = 500 } = $$props;
    	let { data = [] } = $$props;
    	let { fontSize = width * 0.03 } = $$props;
    	let { subtitle = null } = $$props;
    	let { color = 'black' } = $$props;

    	/**
     * @see http://jsbin.com/quhujowota/1
     */
    	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    		var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

    		return {
    			x: centerX + radius * Math.cos(angleInRadians),
    			y: centerY + radius * Math.sin(angleInRadians)
    		};
    	}

    	/**
     * @see http://jsbin.com/quhujowota/1
     */
    	function describeArc(x, y, radius, startAngle, endAngle) {
    		var start = polarToCartesian(x, y, radius, endAngle);
    		var end = polarToCartesian(x, y, radius, startAngle);
    		var largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    		var invert = 0;

    		var d = [
    			"M",
    			start.x,
    			start.y,
    			"A",
    			radius,
    			radius,
    			0,
    			largeArcFlag,
    			invert,
    			end.x,
    			end.y
    		].join(" ");

    		return d;
    	}

    	function getArcs(data) {
    		let lastAngle = 0;

    		return data.filter(entry => entry.value > 0).map((arc, index) => {
    			let percentage = arc.value / maxValue;
    			let startAngle = lastAngle;
    			let endAngle = lastAngle = startAngle + 360 * percentage;
    			const labelPointPosition = polarToCartesian(centerX, centerY, radius + radiusDistance, endAngle - 360 * percentage / 2);
    			const x = labelPointPosition.x;
    			const y = labelPointPosition.y;
    			const d = describeArc(centerX, centerY, radius, startAngle + spacing, endAngle - spacing);

    			return {
    				x,
    				y,
    				d,
    				color: arc.color || color,
    				opacity: 1, //(percentage+opacityMin) > 1 ? 1 : percentage + opacityMin,
    				title: `${arc.title || arc.key} ${(percentage * 100).toFixed(0)}%`,
    				subTitle: arc.subTitle || arc.keys.join(', '),
    				value: arc.value
    			};
    		});
    	}

    	const writable_props = ['width', 'height', 'data', 'fontSize', 'subtitle', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DonatChart> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('fontSize' in $$props) $$invalidate(3, fontSize = $$props.fontSize);
    		if ('subtitle' in $$props) $$invalidate(4, subtitle = $$props.subtitle);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		width,
    		height,
    		data,
    		fontSize,
    		subtitle,
    		color,
    		opacityMin,
    		polarToCartesian,
    		describeArc,
    		getArcs,
    		spacing,
    		radius,
    		centerY,
    		centerX,
    		radiusDistance,
    		maxValue,
    		arcs,
    		titleDistance,
    		viewBox
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('fontSize' in $$props) $$invalidate(3, fontSize = $$props.fontSize);
    		if ('subtitle' in $$props) $$invalidate(4, subtitle = $$props.subtitle);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('spacing' in $$props) spacing = $$props.spacing;
    		if ('radius' in $$props) $$invalidate(6, radius = $$props.radius);
    		if ('centerY' in $$props) centerY = $$props.centerY;
    		if ('centerX' in $$props) $$invalidate(7, centerX = $$props.centerX);
    		if ('radiusDistance' in $$props) radiusDistance = $$props.radiusDistance;
    		if ('maxValue' in $$props) maxValue = $$props.maxValue;
    		if ('arcs' in $$props) $$invalidate(8, arcs = $$props.arcs);
    		if ('titleDistance' in $$props) $$invalidate(9, titleDistance = $$props.titleDistance);
    		if ('viewBox' in $$props) $$invalidate(10, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 1) {
    			$$invalidate(7, centerX = width / 2);
    		}

    		if ($$self.$$.dirty & /*height*/ 2) {
    			centerY = height / 2;
    		}

    		if ($$self.$$.dirty & /*width, height*/ 3) {
    			$$invalidate(10, viewBox = `0 0 ${width} ${height}`);
    		}

    		if ($$self.$$.dirty & /*width*/ 1) {
    			$$invalidate(6, radius = width * 0.15);
    		}

    		if ($$self.$$.dirty & /*radius*/ 64) {
    			radiusDistance = radius * 0.25;
    		}

    		if ($$self.$$.dirty & /*radius*/ 64) {
    			$$invalidate(9, titleDistance = radius * 0.4);
    		}

    		if ($$self.$$.dirty & /*data*/ 4) {
    			maxValue = data.reduce((sum, d) => sum + d.value, 0);
    		}

    		if ($$self.$$.dirty & /*data*/ 4) {
    			$$invalidate(8, arcs = getArcs(data));
    		}
    	};

    	spacing = 1;

    	return [
    		width,
    		height,
    		data,
    		fontSize,
    		subtitle,
    		color,
    		radius,
    		centerX,
    		arcs,
    		titleDistance,
    		viewBox
    	];
    }

    class DonatChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			width: 0,
    			height: 1,
    			data: 2,
    			fontSize: 3,
    			subtitle: 4,
    			color: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DonatChart",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get width() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<DonatChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<DonatChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/desktop/Statistics/Statistics.svelte generated by Svelte v3.50.1 */

    const { console: console_1 } = globals;
    const file = "src/desktop/Statistics/Statistics.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let section0;
    	let div0;
    	let barchart0;
    	let t0;
    	let div1;
    	let barchart1;
    	let t1;
    	let section1;
    	let div2;
    	let donatchart;
    	let current;

    	barchart0 = new BarChart({
    			props: {
    				title: "Altersverteilung",
    				subtitle: /*ageSubtitle*/ ctx[1],
    				data: /*dataAge*/ ctx[5],
    				width: "480",
    				height: "320",
    				color: "var(--werkstadt-orange)"
    			},
    			$$inline: true
    		});

    	barchart1 = new BarChart({
    			props: {
    				title: "Geschlecht",
    				subtitle: /*genderSubtitle*/ ctx[2],
    				data: /*dataGender*/ ctx[4],
    				width: "480",
    				height: "320",
    				color: "var(--werkstadt-purple)"
    			},
    			$$inline: true
    		});

    	donatchart = new DonatChart({
    			props: {
    				width: "800",
    				height: "500",
    				color: "rgba(60, 188, 150, 1)",
    				subtitle: /*locationSubtitle*/ ctx[3],
    				data: /*dataLocation*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			create_component(barchart0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(barchart1.$$.fragment);
    			t1 = space();
    			section1 = element("section");
    			div2 = element("div");
    			create_component(donatchart.$$.fragment);
    			attr_dev(div0, "class", "chart svelte-13e03ik");
    			add_location(div0, file, 102, 2, 2725);
    			attr_dev(div1, "class", "chart svelte-13e03ik");
    			add_location(div1, file, 111, 2, 2917);
    			attr_dev(section0, "class", "svelte-13e03ik");
    			add_location(section0, file, 101, 1, 2713);
    			attr_dev(div2, "class", "chart svelte-13e03ik");
    			add_location(div2, file, 122, 2, 3130);
    			attr_dev(section1, "class", "svelte-13e03ik");
    			add_location(section1, file, 121, 1, 3118);
    			attr_dev(div3, "class", "wsf-statistics");
    			add_location(div3, file, 100, 0, 2683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, section0);
    			append_dev(section0, div0);
    			mount_component(barchart0, div0, null);
    			append_dev(section0, t0);
    			append_dev(section0, div1);
    			mount_component(barchart1, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, section1);
    			append_dev(section1, div2);
    			mount_component(donatchart, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const barchart0_changes = {};
    			if (dirty & /*ageSubtitle*/ 2) barchart0_changes.subtitle = /*ageSubtitle*/ ctx[1];
    			if (dirty & /*dataAge*/ 32) barchart0_changes.data = /*dataAge*/ ctx[5];
    			barchart0.$set(barchart0_changes);
    			const barchart1_changes = {};
    			if (dirty & /*genderSubtitle*/ 4) barchart1_changes.subtitle = /*genderSubtitle*/ ctx[2];
    			if (dirty & /*dataGender*/ 16) barchart1_changes.data = /*dataGender*/ ctx[4];
    			barchart1.$set(barchart1_changes);
    			const donatchart_changes = {};
    			if (dirty & /*locationSubtitle*/ 8) donatchart_changes.subtitle = /*locationSubtitle*/ ctx[3];
    			if (dirty & /*dataLocation*/ 1) donatchart_changes.data = /*dataLocation*/ ctx[0];
    			donatchart.$set(donatchart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(barchart0.$$.fragment, local);
    			transition_in(barchart1.$$.fragment, local);
    			transition_in(donatchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(barchart0.$$.fragment, local);
    			transition_out(barchart1.$$.fragment, local);
    			transition_out(donatchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(barchart0);
    			destroy_component(barchart1);
    			destroy_component(donatchart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let ageData;
    	let genderData;
    	let locationData;
    	let dataAge;
    	let dataGender;
    	let locationSum;
    	let $statisticsStore;
    	validate_store(statisticsStore, 'statisticsStore');
    	component_subscribe($$self, statisticsStore, $$value => $$invalidate(10, $statisticsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Statistics', slots, []);
    	let dataLocation = [];
    	let ageSubtitle = null;
    	let genderSubtitle = null;
    	let locationSubtitle = null;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Statistics> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		BarChart,
    		DonatChart,
    		statisticsStore,
    		dataLocation,
    		ageSubtitle,
    		genderSubtitle,
    		locationSubtitle,
    		locationSum,
    		locationData,
    		genderData,
    		dataGender,
    		ageData,
    		dataAge,
    		$statisticsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('dataLocation' in $$props) $$invalidate(0, dataLocation = $$props.dataLocation);
    		if ('ageSubtitle' in $$props) $$invalidate(1, ageSubtitle = $$props.ageSubtitle);
    		if ('genderSubtitle' in $$props) $$invalidate(2, genderSubtitle = $$props.genderSubtitle);
    		if ('locationSubtitle' in $$props) $$invalidate(3, locationSubtitle = $$props.locationSubtitle);
    		if ('locationSum' in $$props) $$invalidate(6, locationSum = $$props.locationSum);
    		if ('locationData' in $$props) $$invalidate(7, locationData = $$props.locationData);
    		if ('genderData' in $$props) $$invalidate(8, genderData = $$props.genderData);
    		if ('dataGender' in $$props) $$invalidate(4, dataGender = $$props.dataGender);
    		if ('ageData' in $$props) $$invalidate(9, ageData = $$props.ageData);
    		if ('dataAge' in $$props) $$invalidate(5, dataAge = $$props.dataAge);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$statisticsStore*/ 1024) {
    			$$invalidate(9, ageData = $statisticsStore.age || []);
    		}

    		if ($$self.$$.dirty & /*$statisticsStore*/ 1024) {
    			$$invalidate(8, genderData = $statisticsStore.gender || []);
    		}

    		if ($$self.$$.dirty & /*$statisticsStore*/ 1024) {
    			$$invalidate(7, locationData = $statisticsStore.location || []);
    		}

    		if ($$self.$$.dirty & /*ageData*/ 512) {
    			$$invalidate(5, dataAge = ageData.filter(entry => entry.key !== 'unknown'));
    		}

    		if ($$self.$$.dirty & /*ageData*/ 512) {
    			{
    				const unknownEntry = ageData
    				? ageData.find(entry => entry.key === 'unknown')
    				: null;

    				const unknownCount = unknownEntry ? unknownEntry.value : null;

    				$$invalidate(1, ageSubtitle = unknownCount
    				? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' : 'Mensch hat'} keine Angabe gemacht`
    				: null);
    			}
    		}

    		if ($$self.$$.dirty & /*genderData*/ 256) {
    			$$invalidate(4, dataGender = genderData.filter(entry => entry.key !== 'unknown'));
    		}

    		if ($$self.$$.dirty & /*genderData*/ 256) {
    			{
    				const unknownEntry = genderData
    				? genderData.find(entry => entry.key === 'unknown')
    				: null;

    				const unknownCount = unknownEntry ? unknownEntry.value : null;

    				$$invalidate(2, genderSubtitle = unknownCount
    				? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' : 'Mensch hat'} keine Angabe gemacht`
    				: null);
    			}
    		}

    		if ($$self.$$.dirty & /*locationData*/ 128) {
    			$$invalidate(6, locationSum = locationData.map(d => d.value).reduce((a, b) => a + b, 0));
    		}

    		if ($$self.$$.dirty & /*locationData*/ 128) {
    			{
    				const unknownEntry = locationData
    				? locationData.find(entry => entry.key === 'unknown')
    				: null;

    				const unknownCount = unknownEntry ? unknownEntry.value : null;

    				$$invalidate(3, locationSubtitle = unknownCount
    				? `${unknownCount} ${unknownCount > 1 ? 'Menschen haben' : 'Mensch hat'} keine Angabe gemacht`
    				: null);
    			}
    		}

    		if ($$self.$$.dirty & /*locationData, locationSum*/ 192) {
    			{
    				const groups = [
    					{
    						key: "Zentrum",
    						keys: ["Innenstadt", "Westvorstadt"],
    						value: 0,
    						color: "rgba(60, 188, 150, 1)"
    					},
    					{
    						key: "Osten",
    						keys: ["Stadtgrenze", "Poppenreuth", "Espan"],
    						value: 0,
    						color: "rgba(60, 188, 150, 0.4)"
    					},
    					{
    						key: "Süden",
    						keys: ["Südstadt", "Dambach"],
    						value: 0,
    						color: "rgba(60, 188, 150, 0.9)"
    					},
    					{
    						key: "Norden",
    						keys: ["Vach", "Stadeln", "Ronhof", "Mannhof", "Ritzmannshof", "Atzenhof"],
    						value: 0,
    						color: "rgba(60, 188, 150, 0.6)"
    					},
    					{
    						key: "Westen",
    						keys: [
    							"Hardhöhe",
    							"Eigenes Heim",
    							"Burgfarrnbach",
    							"Oberfürberg",
    							"Unterfürberg",
    							"Unterfarrnbach"
    						],
    						value: 0,
    						color: "rgba(60, 188, 150, 0.8)"
    					}
    				];

    				for (const entry of locationData) {
    					let found = false;

    					for (const group of groups.filter(entry => entry.key !== 'unknown')) {
    						if (group.keys.includes(entry.key)) {
    							group.value += entry.value / locationSum;
    							found = true;
    						}
    					}

    					if (!found) {
    						console.warn(`No group found for entry "${entry.key}"`);
    					}
    				}

    				$$invalidate(0, dataLocation = groups);
    			}
    		}
    	};

    	return [
    		dataLocation,
    		ageSubtitle,
    		genderSubtitle,
    		locationSubtitle,
    		dataGender,
    		dataAge,
    		locationSum,
    		locationData,
    		genderData,
    		ageData,
    		$statisticsStore
    	];
    }

    class Statistics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statistics",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const statistics = new Statistics({
    	target: document.getElementById('werkstadt-2031-statistics')
    });

    const app = new App({
    	target: document.getElementById('werkstadt-2031-app')
    });

    exports["default"] = app;
    exports.statistics = statistics;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=bundle.js.map
