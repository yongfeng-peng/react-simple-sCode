
/**
 * 
 * @param {类型} type 
 * @param {所有属性} props 
 * @param  {...any} children 
 */
function createElement(type, props, ...children) {
  delete props.__source;
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child == 'object' ? child: createTextElement(child);
      })
    }
  }
}

/**
 * 
 * @param {文本类型的虚拟dom创建} text 
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
 * 通过虚拟dom新建dom元素
 * {虚拟dom} vdom 
 */
function createDom(vdom) {
  let dom = vdom && (vdom.type === 'TEXT') ? document.createTextNode('') : document.createElement(vdom.type);
  // Object.keys(vdom.props)
  // .filter(key => key !== 'children')
  // .forEach(name => {
  //   // @todo 事件处理 属性兼容
  //   dom[name] = vdom.props[name]
  // })
  updateDom(dom, {}, vdom.props);
  return dom;
}


// dom更新
function updateDom(dom, prevProps, nextProps) {
  // 1。规避children属性
  // 2.老的存在，取消
  // 3.新的存在 新增 并没有做新老相当的判定
  // @todo兼容性问题
  Object.keys(prevProps)
  .filter(name=>name !== 'children')
  .filter(name => !(name in nextProps))
  .forEach(name => {
    // 删除
    if(name.slice(0,2) === 'on'){
      // onClick => click
      dom.removeEventListener(name.slice(2).toLowerCase(), prevProps[name], false);
    }else{
      dom[name] = '';
    }
  })

  Object.keys(nextProps)
  .filter(name=>name !== 'children')
  .forEach(name => {
    // 删除
    if(name.slice(0,2) === 'on') {
      dom.addEventListener(name.slice(2).toLowerCase(), nextProps[name],false)
    }else{
      dom[name] = nextProps[name]
    }
  })

}

/**
 * 
 * @param {虚拟dom} vdom 
 * @param {容器} container 
 */
function render(vdom, container) {
  // container.innerHTML = `<pre>${JSON.stringify(vdom, null, 2)}</pre>`;
  wipRoot = {
    dom: container,
    props: {
      children: [vdom]
    },
    base: currentRoot,
  };  
  deletions = [];
  nextUnitOfWork = wipRoot;
  // vdom.props.children.forEach(child => {
  //   render(child, dom);
  // })
  // container.appendChild(dom);
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null; // 不让重复工作
}

function commitWork(fiber) {
  if(!fiber) {
    return;
  }
  // const domParent = fiber.parent.dom;
  // 向上查找
  let domParentFiber = fiber.parent;
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    // 更新dom
    updateDom(
      fiber.dom,
      fiber.base.props,
      fiber.props
    )
  } else if (fiber.effectTag === 'DELETION') {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  } 
  // domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}


// 下一个单元任务
// render会初始化第一个任务
let nextUnitOfWork = null;
let wipRoot = null; // 保存全局的fiber
let currentRoot = null;
let deletions = null;
/**
 * 调度diff或者渲染任务
 */
function workLoop(deadline) {
  // 有任务，并且当前帧没有结束
  while(nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if(!nextUnitOfWork && wipRoot) {
    // 没有任务，并且根节点存在
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

/** 
 * 启动空闲时间渲染
*/
requestIdleCallback(workLoop);

/**
 * 获取下一个任务
 *
 * @param {*} fiber
 */
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  
  // 找下一个任务
  // 先找子元素
  if(fiber.child) {
    return fiber.child;
  }
  // 没有子元素就找兄弟元素
  let nextFiber = fiber;
  while(nextFiber) {
    if(nextFiber.slibing) {
      return nextFiber.slibing
    }
    // 没有兄弟元素。找父元素
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = null;
function useState(init) {
  const oldHook =
  wipFiber.base &&
  wipFiber.base.hooks &&
  wipFiber.base.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : init,
    queue: [], // 修改队列
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action
  });
  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      base: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }
  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

function updateFunctionComponent(fiber) {
  // wipFiber = fiber
  // hookIndex = 0
  // wipFiber.hooks = []
  // 执行函数，传入props
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  // 根据当前任务，获取下一个任务
  if(fiber.dom) {
    //  不是入口
    fiber.dom = createDom(fiber);
  }
  // 真实的dom操作
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function reconcileChildren(wipFiber, elements) {
  // 构建fiber结构
  let index = 0;
  let oldFiber = wipFiber.base && wipFiber.base.child;
  let prevSibling = null;
  // while(index < elements.length) {
  while(index < elements.length && oldFiber != null) {
    let element = elements[index];
    let newFiber = null;
    // 对比oldFiber的状态和当前的element
    // 先比较类型
    const sameType = oldFiber && element && oldFiber.type === element.type;
    if(sameType) {
      // 复用节点，更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        base: oldFiber,
        effectTag: 'UPDATE'
      };
    }
    if(!sameType && element) {
      // 替换
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        base: null,
        effectTag: 'PLACEMENT'
      };
    }
    if(!sameType && oldFiber) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }
    if(oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: wipFiber,
    //   dom: null
    // };
    if(index === 0) {
      // 第一个元素.是父fiber的child属性
      wipFiber.child = newFiber;
    } else {
      // 其它是以
      prevSibling.slibing = newFiber;
    }
    prevSibling = newFiber;
    index++;
    // fiber基本结构构建完成
  }
}

// fiber = {
//   dom: 真实dom,
//   parent: 父亲,
//   child: 第一个子元素,
//   slibing: 兄弟
// };

class Component {
  constructor(props){
    this.props = props;
    // this.state = {}
  }
}

// 把类组件，转成函数组件，利用hooks实现setState
function transfer(Component){
  return function(props){
    const component = new Component(props);
    let [state, setState] = useState(component.state);
    component.props = props;
    component.state = state;
    component.setState = setState;
    console.log(component);
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