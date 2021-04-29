const isAtom = v => typeof v.get === 'function';

const setStyle = (renderContext, el, styleName, value) => {

    if(isAtom(value)) {

        renderContext.subscribe(value, newVal => el.style[styleName] = newVal);

    } else {

        el.style[styleName] = value;

    }

};

const setProp = (renderContext, el, name, value) => {

    if(name.startsWith('on') && typeof value === 'function') {

        const evtType = name.substring(2).toLowerCase();

        (renderContext.listeners[evtType] = renderContext.listeners[evtType] || [])
            .push(e => e.target === el && value(e));
    
    } else if(typeof value === 'object') {

        if(name === 'style') {

            Object.entries(value).forEach(style => setStyle(renderContext, el, ...style));

        } else {

            renderContext.subscribe(
                value, // the atom
                propVal => {
                    if(propVal === false) {

                        el.removeAttribute(name);
                
                    } else {
                
                        el.setAttribute(name, propVal);
                
                    }                
                }
            );

        }

    } else {
    
        el.setAttribute(name, value);
    
    }

};

const append = (renderContext, el, ...children) => {

    children.forEach(child => {

        if(!child) return;

        if(Array.isArray(child)) {
            
            append(renderContext, el, ...child);
        
        } else if(typeof child === 'string' || typeof child === 'number') {
    
            const textNode = document.createTextNode(child);

            el.appendChild(textNode);

        } else if(child instanceof HTMLElement) {
        
            el.appendChild(child);
        
        } else if(typeof child === 'object' && isAtom(child)) {

            let textNode;

            renderContext.subscribe(
                child, 
                value => {
                    if(!textNode) {
                        textNode = document.createTextNode(value);
                        el.appendChild(textNode);
                    } else {
                        textNode.data = value;
                    }
                }
            );

        }

    });

};

const createElementWithRenderContext = renderContext => (tagName, props = {}, ...children) => {

    const el = document.createElement(tagName);

    if(props) {
        
        const { ref, ...rest } = props;
        
        if(ref) {
            ref.setCurrent(el);
        }
        
        Object.entries(rest).forEach(prop => setProp(renderContext, el, ...prop));
    
    }

    const frag = document.createDocumentFragment();

    append(renderContext, frag, ...children);

    el.appendChild(frag);

    return el;

};

const render = (root, view) => {

    const renderContext = {
        cleanupFns: [],
        listeners: {},
        subscribe($atom, fn) {
            const initVal = $atom.get();
            fn(initVal);
            const unsub = $atom.subscribe(fn);
            this.cleanupFns.push(unsub);
        }
    };

    const node = view(
        createElementWithRenderContext(renderContext) 
    );

    Object.entries(renderContext.listeners).forEach(([type, fns]) => {
        node.addEventListener(type, e => fns.forEach(fn => fn(e)));
    });

    root.appendChild(node);

    return () => renderContext.cleanupFns.forEach(unsub => unsub());

};

export default render;
