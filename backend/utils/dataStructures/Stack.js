import Node from "./Node.js";

class Stack {
  constructor() {
    this.top = null;
  }

  isEmpty() {
    return this.top == null;
  }

  push(value) {
    let newNode = new Node(value);
    newNode.next = this.top;
    this.top = newNode;
    console.log(value + " Pushed");
  }

  pop() {
    if (this.isEmpty()) {
      console.log("Stack is Empty");
      return -1;
    }
    let data = this.top.data;
    this.top = this.top.next;
    console.log(data + "Popped");
    return data;
  }

  peek() {
    if (this.isEmpty()) {
      console.log("Stack is Empty");
      return -1;
    }
    return this.top.data;
  }
}

export default Stack;
