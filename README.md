# hyperwc
Hyperscript for Reactive Web Components Using Atoms

Hyperwc is a hyperscript library for creating reactive views for native web components. Reactivity in Hyperwc is achieved via using [https://github.com/rwbeast/atom](atom.js) 

```javascript
import render from './path/to/hyperwc.js';

class CounterApp extends HTMLElement {

  counter = atom(0)

  connectedCallback() {
    this.unsubscribeSubs = render(this, this.view.bind(this));
  }
  
  disconnectedCallback() {
    this.unsubscribeSubs();
  }
  
  increment() {
    this.counter.set(count => count + 1);
  }
  
  decrement() {
    this.counter.set(count => count - 1);
  }
  
  view(h) {
    return (
      h('div', null, this.counter),
      h('button', { onClick: this.increment.bind(this) }, '+'),
      h('button', { onClick: this.decrement.bind(this) }, '-')
    )
  }

}
```
