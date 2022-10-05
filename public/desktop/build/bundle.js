
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    /* src\desktop\Card.svelte generated by Svelte v3.50.1 */

    const file$7 = "src\\desktop\\Card.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "card " + /*classes*/ ctx[2].join(' ') + " svelte-1j9mf1z");
    			attr_dev(div, "title", /*title*/ ctx[1]);
    			add_location(div, file$7, 38, 0, 995);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*classes*/ 4 && div_class_value !== (div_class_value = "card " + /*classes*/ ctx[2].join(' ') + " svelte-1j9mf1z")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(div, "title", /*title*/ ctx[1]);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { gender = null } = $$props;
    	let { age = null } = $$props;
    	let { location = null } = $$props;
    	let { text = '' } = $$props;
    	let title;
    	let classes;
    	const writable_props = ['gender', 'age', 'location', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('gender' in $$props) $$invalidate(3, gender = $$props.gender);
    		if ('age' in $$props) $$invalidate(4, age = $$props.age);
    		if ('location' in $$props) $$invalidate(5, location = $$props.location);
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		gender,
    		age,
    		location,
    		text,
    		title,
    		classes
    	});

    	$$self.$inject_state = $$props => {
    		if ('gender' in $$props) $$invalidate(3, gender = $$props.gender);
    		if ('age' in $$props) $$invalidate(4, age = $$props.age);
    		if ('location' in $$props) $$invalidate(5, location = $$props.location);
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text, gender, age, location*/ 57) {
    			{
    				// tooltip on hover	
    				const titleText = `"${text}"`;

    				const titleGender = gender === 'm' ? 'Mann' : gender === 'w' ? 'Frau' : null;
    				const titleAge = age ? `(${age} Jahre)` : '';
    				const titleLocation = location ? `aus ${location}` : '';

    				$$invalidate(1, title = [
    					titleText,
    					[titleGender, titleAge, titleLocation].filter(Boolean).join(' ')
    				].join('\n'));

    				// classes
    				const textLength = text.length;

    				if (textLength <= 40) {
    					$$invalidate(2, classes = ['xxs', 'postit']);
    				} else if (textLength <= 75) {
    					$$invalidate(2, classes = ['xs', 'postit']);
    				} else if (textLength <= 100) {
    					$$invalidate(2, classes = ['s', 'postit']);
    				} else if (textLength <= 200) {
    					$$invalidate(2, classes = ['m', 'postit']);
    				} else if (textLength <= 270) {
    					$$invalidate(2, classes = ['l', 'postit']);
    				} else if (textLength <= 450) {
    					$$invalidate(2, classes = ['xl', 'postit']);
    				} else {
    					$$invalidate(2, classes = ['xxl', 'cardboard']);
    				}
    			}
    		}
    	};

    	return [text, title, classes, gender, age, location];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { gender: 3, age: 4, location: 5, text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$7.name
    		});
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

    const categoriesStore = readable([], set => {
    	fetchJson('./categories.json').then(set);
    });

    const cardsStore = readable([], set => {
    	fetchJson('./entries.json').then(set);
    });

    const selectedMainCategoryStore = writable();
    const selectedSubCategoryStore = writable();

    /* src\desktop\Cards.svelte generated by Svelte v3.50.1 */
    const file$6 = "src\\desktop\\Cards.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (33:0) {:catch error}
    function create_catch_block(ctx) {
    	let div;
    	let t_value = /*error*/ ctx[8].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			set_style(div, "color", "red");
    			add_location(div, file$6, 33, 0, 876);
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
    		source: "(33:0) {:catch error}",
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

    			attr_dev(ul, "id", "cardsList");
    			attr_dev(ul, "class", "cards svelte-mzcogh");
    			add_location(ul, file$6, 20, 0, 637);
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
    		id: create_then_block.name,
    		type: "then",
    		source: "(20:0) {:then number}",
    		ctx
    	});

    	return block;
    }

    // (22:1) {#each cards as card}
    function create_each_block$2(ctx) {
    	let li;
    	let werkstadtcard;
    	let t;
    	let current;

    	werkstadtcard = new Card({
    			props: {
    				gender: /*card*/ ctx[5].gender,
    				age: /*card*/ ctx[5].age,
    				location: /*card*/ ctx[5].location,
    				text: /*card*/ ctx[5].text
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(werkstadtcard.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-mzcogh");
    			add_location(li, file$6, 22, 1, 695);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(werkstadtcard, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const werkstadtcard_changes = {};
    			if (dirty & /*cards*/ 1) werkstadtcard_changes.gender = /*card*/ ctx[5].gender;
    			if (dirty & /*cards*/ 1) werkstadtcard_changes.age = /*card*/ ctx[5].age;
    			if (dirty & /*cards*/ 1) werkstadtcard_changes.location = /*card*/ ctx[5].location;
    			if (dirty & /*cards*/ 1) werkstadtcard_changes.text = /*card*/ ctx[5].text;
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
    		id: create_each_block$2.name,
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
    			add_location(div, file$6, 18, 0, 600);
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

    function create_fragment$6(ctx) {
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
    			add_location(link0, file$6, 1, 1, 15);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file$6, 2, 1, 76);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=Reenie+Beanie&family=Shadows+Into+Light+Two&family=Square+Peg&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file$6, 3, 1, 149);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { mainCategory: 1, subCategory: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cards",
    			options,
    			id: create_fragment$6.name
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

    /* src\desktop\NavigationButton.svelte generated by Svelte v3.50.1 */
    const file$5 = "src\\desktop\\NavigationButton.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(h2, file$5, 24, 1, 458);
    			attr_dev(div, "class", "sub-item-count svelte-1336dkq");
    			add_location(div, file$5, 25, 1, 477);
    			attr_dev(li, "id", /*id*/ ctx[1]);
    			attr_dev(li, "class", li_class_value = "btn " + /*type*/ ctx[0] + " svelte-1336dkq");
    			attr_dev(li, "data-count", /*count*/ ctx[2]);
    			toggle_class(li, "selected", /*selected*/ ctx[4]);
    			add_location(li, file$5, 18, 0, 355);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
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
    			id: create_fragment$5.name
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

    /* src\desktop\NavigationMain.svelte generated by Svelte v3.50.1 */
    const file$4 = "src\\desktop\\NavigationMain.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (19:1) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$4, 19, 2, 503);
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
    		source: "(19:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#if $categoriesStore.length}
    function create_if_block$2(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$categoriesStore*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(ul, file$4, 7, 2, 209);
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(7:1) {#if $categoriesStore.length}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each $categoriesStore as mainCat}
    function create_each_block$1(ctx) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:2) {#each $categoriesStore as mainCat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let nav;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
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
    			add_location(nav, file$4, 5, 0, 168);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationMain",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\desktop\NavigationSub.svelte generated by Svelte v3.50.1 */

    const file$3 = "src\\desktop\\NavigationSub.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (30:1) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$3, 30, 2, 863);
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
    		source: "(30:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:1) {#if $subCatsStore}
    function create_if_block$1(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$subCatsStore*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			add_location(ul, file$3, 18, 1, 580);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:1) {#if $subCatsStore}",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#each $subCatsStore as subCat}
    function create_each_block(ctx) {
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:2) {#each $subCatsStore as subCat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let nav;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
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
    			add_location(nav, file$3, 16, 0, 550);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationSub",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\desktop\Footer.svelte generated by Svelte v3.50.1 */

    const file$2 = "src\\desktop\\Footer.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(div, file$2, 1, 1, 28);
    			attr_dev(a, "href", "https://fullstax.de");
    			attr_dev(a, "class", "svelte-tnkizv");
    			add_location(a, file$2, 2, 1, 62);
    			attr_dev(footer, "class", "copyright svelte-tnkizv");
    			add_location(footer, file$2, 0, 0, 0);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\desktop\Header.svelte generated by Svelte v3.50.1 */

    const file$1 = "src\\desktop\\Header.svelte";

    function create_fragment$1(ctx) {
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
    			add_location(br0, file$1, 1, 29, 38);
    			add_location(br1, file$1, 1, 39, 48);
    			attr_dev(section0, "class", "minSize svelte-19nnlb7");
    			add_location(section0, file$1, 1, 1, 10);
    			attr_dev(h2, "class", "svelte-19nnlb7");
    			add_location(h2, file$1, 3, 2, 95);
    			attr_dev(div, "class", "subtitle svelte-19nnlb7");
    			add_location(div, file$1, 4, 2, 136);
    			attr_dev(section1, "class", "grow svelte-19nnlb7");
    			add_location(section1, file$1, 2, 1, 70);
    			attr_dev(header, "class", "svelte-19nnlb7");
    			add_location(header, file$1, 0, 0, 0);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\desktop\App.svelte generated by Svelte v3.50.1 */

    const { console: console_1 } = globals;

    const file = "src\\desktop\\App.svelte";

    // (61:1) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "lade Daten...";
    			attr_dev(div, "class", "svelte-19ijd4w");
    			add_location(div, file, 61, 1, 1685);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(61:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#if $categoriesStore.length}
    function create_if_block(ctx) {
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
    			attr_dev(aside, "class", "svelte-19ijd4w");
    			add_location(aside, file, 45, 2, 1308);
    			attr_dev(header, "class", "subCatHeader svelte-19ijd4w");
    			add_location(header, file, 50, 3, 1387);
    			attr_dev(section, "id", "cardsScrollContainer");
    			attr_dev(section, "class", "svelte-19ijd4w");
    			add_location(section, file, 53, 3, 1455);
    			attr_dev(article, "class", "svelte-19ijd4w");
    			add_location(article, file, 49, 2, 1374);
    			attr_dev(main, "class", "svelte-19ijd4w");
    			add_location(main, file, 44, 1, 1299);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(44:1) {#if $categoriesStore.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let werkstadtheader;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	werkstadtheader = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block, create_else_block];
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
    			attr_dev(div, "class", "werkstadt-container svelte-19ijd4w");
    			add_location(div, file, 41, 0, 1212);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
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
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById('werkstadt-2031')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
