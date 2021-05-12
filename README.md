# 主要

```text
dist/
├── index.umd.js (UMD)
└──style.min.css (CSS, compressed)

```

# 依賴

- **jQuery**
- **Bootstrap**
- **jquery-validate**

# 使用說明

## 安裝

In browser:

```html
<script src="https://code.jquery.com/jquery-1.11.2.min.js "></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.1/jquery.validate.min.js"></script>
<script src="http://ajax.aspnetcdn.com/ajax/mvc/3.0/jquery.validate.unobtrusive.min.js"></script>
```

## 用法

### Syntax

```js
let myTree = new OrgTreePopover(element, (options = {}));
```

- **element**

  - Type: `String`

- **options** (optional)
  - Type: `Object`
  - 可用的 [options](#options).

## 範例

```html
<div id="tree"></div>
```

```js
// 宣告 orgTreePopover
let myTree = new OrgTreePopover("#tree");
// set options
myTree.setOptions({
  data: _data,
  treeTitle: "部門列表",
  showAdd: true,
  showEdit: true,
  showDelete: true,
  showCheckbox: true,
  onAdd: ()=>{ ... },
  onEdit: ()=>{ ... },
  onDelete: ()=>{ ... }
});
```

## 備註

```text

```

# Options

### data

- Type: `Array`, an Array of node objects
- Default: `[]`
- note: node object: `{id: str, text: str, nodes: [] }`

### treeTitle

- Type: `String`
- Default: `null`
- note: 表單的標題

### showAdd

- Type: `Boolean`
- Default: `True`
- note: 是否顯示 [新增 icon]

### showEdit

- Type: `Boolean`
- Default: `True`
- note: 是否顯示 [編輯 icon]

### showDelete

- Type: `Boolean`
- Default: `True`
- note: 是否顯示 [刪除 icon]

### showCheckbox

- Type: `Boolean`
- Default: `True`
- note: 是否顯示 [Ckeck box icon]

### onAdd

- Type: `Function`
- Default: `null`
- note: 新增子 node

### onEdit

- Type: `Function`
- Default: `null`
- note: 編輯 node

### onDelete

- Type: `Function`
- Default: `null`
- note: 刪除 node

# Methods

### setOption(options)

Set Option to Tree

- **options**
  - Type: `object`

### getNode(id)

Get Node Object by Id

- **return**
  - Type: `Object`

### getParent(id)

Get Parent Node Object by Id

- **return**
  - Type: `Object`

### getSiblings(id)

Get All Sibling Node Object by Id

- **return**
  - Type: `Array`
  - note: an array of node object

### getChilds(id)

Get All Child Node Object by Id

- **return**
  - Type: `Array`
  - note: an array of node object

### getSelectedTags(id)

Get Selected Tags by Id, Ingore Mother-Child Repeataion

- **return**
  - Type: `Array`
  - note: an array of node object

### getSelecte(id)

Get All Selected Node Object by Id

- **return**
  - Type: `Array`
  - note: an array of node object

### getUnselecte(id)

Get All Unselected Node Object by Id

- **return**
  - Type: `Array`
  - note: an array of node object

### openEditDialog(options = {})

Open Edit/Add Dialog

- **options**

  - Type: `Object`
  - note:

  ```
  {
    mode: ['edit' | 'add'],
    title: {String},
    node: {Object},
    onSave: {function}
  }
  ```
### openDeleteDialog(options = {})

Open Delete Dialog

- **options**

  - Type: `Object`
  - note:

  ```
  {
    mode: ['delete'],
    title: {String},
    node: {Object},
    onSave: {function}
  }
  ```

### updateNode(node)

Update Node

- **node**
  - Type: `Object`
- **return**
  - Type: `Boolean`
  - note: whether this update is successful or not

### addNode(parent, newNode)

Add Node

- **parent**
  - Type: `Object`
  - note: the node that will be added to
- **newNode**
  - Type: `Object`
  - note: the new node
- **return**
  - Type: `Boolean`
  - note: whether this addition is successful or not

### deleteNode(node)

Delete Node

- **node**
  - Type: `Object`
- **return**
  - Type: `Boolean`
  - note: whether this deletion is successful or not

## 瀏覽器支援

- ### Chrome (latest)
- ### ~~Firefox (latest)~~
- ### ~~Safari (latest)~~
- ### ~~Opera (latest)~~
- ### ~~Edge (latest)~~
- ### ~~Internet Explorer 11~~
