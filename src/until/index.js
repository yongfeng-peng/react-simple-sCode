/**
 * 
 * @param {str|function} 类型，是字符串div 还是函数 
 * @param {*} jsx传递的属性 
 * @param  {...any} 子元素 
 */
function createElement(type, props, ...children) {
  delete props.__source;
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object' ? child : createTextElement(child);
      })
    }
  }
}

/**
 * 文本类型的虚拟dom创建
 */
function createTextElement(text) {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

/**
 * 通过虚拟dom，新建dom元素
 * @param {虚拟dom} vdom 
 */
function createDom(vdom) {
  const dom = vdom.type === 'TEXT' ? 
  document.createTextNode('') : document.createElement(vdom.type);
  // Object.keys(vdom.props)
  // .filter(key => key !== 'children')
  // .forEach(name => {
  //   // @todo 事件处理，属性兼容
  //   dom[name] = vdom.props[name]; 
  // });
  updateDom(dom, {}, vdom.props);
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  // 1.规避children属性
  // 2.老的存在，取消
  // 3.新的存在，新增，并没有做新老相等的判定
  // @todo 兼容性问题
  Object.keys(prevProps)
  .filter(name => name !== 'children')
  .filter(name => !(name in nextProps))
  .forEach(name => {
    if(name.slice(0, 2) === 'on') {
      // onClick => click
      dom.removeEventListener(name.slice(2).toLowerCase(), prevProps[name], false);
    } else {
      dom[name] = '';
    }
  })
  Object.keys(nextProps)
  .filter(name => name !== 'children')
  .forEach(name => {
    if(name.slice(0, 2) === 'on') {
      // onClick => click
      dom.addEventListener(name.slice(2).toLowerCase(), nextProps[name], false);
    } else {
      dom[name] = nextProps[name];
    }
  })
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null; // 防止重复工作
}

function commitWork(fiber) {
  if(!fiber) {
    return;
  }
  // const domParent = fiber.parent.dom;
  let domParentFiber = fiber.parent;
  // 向上查找
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  // domParent.appendChild(fiber.dom);
  const domParent = domParentFiber.dom;
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if(fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    // 更新dom
    updateDom(fiber.dom, fiber.base.props, fiber.props);
  } else if(fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
    // domParent.removeChild(fiber.dom);
  } 
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if(fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

/**
 * 
 * @param {渲染虚拟dom} vdom 
 * @param {容器} container 
 */
function render(vdom, container) {
  // container.innerHTML = `<pre>${JSON.stringify(vdom, null, 2)}</pre>`;
  wipRoot = {
    dom: container,
    props: {
      children: [vdom]
    },
    base: currentRoot, // 存储的上一fiber节点
  };
  deletions = []; // 管理删除数据
  nextUnitOfWork = wipRoot;
  // vdom.props.children.forEach(child => {
  //   render(child, dom);
  // })
  // console.log(dom);
  // container.appendChild(dom);
}

// render会初始化第一个任务
let nextUnitOfWork = null; // 下一个单元任务
let wipRoot = null; // 保存全局的fiber根节点
let currentRoot = null;
let deletions = null;
/**
 * 调度diff或者渲染任务
 * window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队
 */
function workLoop(deadline) {
  // 有下一个任务，并且当前帧还没有结束
  while(nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);  // 类比火车
  }
  if(!nextUnitOfWork && wipRoot) {
    // 没有任务，并且根节点还在
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

// 启动空闲时间处理
requestIdleCallback(workLoop); //并不能减少工作量，只是划分更细

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if(isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // dom
    updateHostComponent(fiber);
  }
  
  // 找下一个任务
  // 先找子元素
  if(fiber.child) {
    return fiber.child;
  }
  // 没有子元素，就找兄弟元素
  let nextFiber = fiber;
  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 没有兄弟元素，找父元素
    nextFiber = nextFiber.parent;
  }
}

function useState(init) {
  const oldHooks = wipFiber.base && wipFiber.base.hooks && wipFiber.base.hooks[hookIndex];
  let hook = {
    state: oldHooks ? oldHooks.state : init,
    queue: []
  };
  const actions = oldHooks ? oldHooks.queue : [];
  actions.forEach(action => {
    hook.state = action;
  })
  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      base: currentRoot
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

let wipFiber = null;
let hookIndex = null;
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);  
}

function updateHostComponent(fiber) {
  // 获取下一个任务
  // 根据当前任务，获取下一个
  if(!fiber.dom) {
    // 不是入口
    fiber.dom = createDom(fiber);
  }
  // 真实的dom操作
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }
  // 
  // const elements = fiber.props.children;
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
    wipFiber.base && wipFiber.base.child
  let prevSibling = null
  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null
    // 对比
    const sameType =
      oldFiber &&
      element &&
      element.type === oldFiber.type
    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        base: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        base: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}

// function reconcileChildren(wipFiber, elements) {
//   // 构建fiber结构
//   let index = 0;
//   let oldFiber = wipFiber.base && wipFiber.base.child;
//   let prevSibling = null;
//   // while(index === elements.length) {
//   while(index < elements.length || oldFiber !== null) {
//     const element = elements[index];
//     let newFiber = null;
//     // 对比oldFiber的状态和当前element
//     // 先比较类型
//     const sameType = oldFiber && element && element.type === oldFiber.type;
//     if(sameType) {
//       // 复用节点，更新
//       newFiber = {
//         type: oldFiber.type,
//         props: element.props,
//         dom: oldFiber.dom,
//         parent: wipFiber,
//         base: oldFiber,
//         effectTag: 'UPDATE'
//       };
//     }
//     // 类型不一样，新节点存在
//     if(!sameType && element) {
//       // 替换节点
//       newFiber = {
//         type: element.type,
//         props: element.props,
//         dom: null,
//         parent: wipFiber,
//         base: null,
//         effectTag: 'PLACEMENT'
//       };
//     }
//     // 类型不一样，老的节点存在
//     if(!sameType && oldFiber) {
//       // 删除
//       oldFiber.effectTag = 'DELETION';
//       deletions.push(oldFiber);
//     }
//     if(oldFiber) {
//       oldFiber = oldFiber.sibling;
//     }
//     if(index === 0) {
//       // 第一个元素是父fiber的child属性
//       wipFiber.child = newFiber;
//     } else if (element) {
//       // 其它的是兄弟元素
//       prevSibling.sibling = newFiber;
//     }
//     prevSibling = newFiber;
//     index++;
//     // fiber基本结构完成
//   }
// }

// fiber = {
//   dom: 真实dom,
//   parent: 父亲,
//   child: 第一个子元素,
//   sibling: 兄弟
// };

class Component {
  constructor(props) {
    this.props = props;
  }
}

// 把类组件，转成函数组件，利用hooks实现setState
function transfer(Component) {
  return function(props) {
    const component = new Component(props);
    let [state, setState] = useState(component.state);
    component.props = props;
    component.state = state;
    component.setState = setState;
    return component.render();
  }
}

export default {
  createElement,
  render,
  useState,
  Component,
  transfer
}