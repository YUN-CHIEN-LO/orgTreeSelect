# 主要

```text
dist/
├── index.umd.js (UMD)
└── style.min.css (CSS, compressed)

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
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/3.2.12/jquery.validate.unobtrusive.min.js"></script>
```

## 用法

### Syntax

```js
let myTree = new OrgTreeSelect(element, (options = {}));
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
// 宣告 orgTreeSelect
let myTree = new OrgTreeSelect("#tree");
// set options
myTree.setOptions({
  data: _data,
  texts: {
    treeTitle: "部門列表",
    selectText: "請選擇",
  },
  showAdd: true,
  showEdit: true,
  showDelete: true,
  showCheckbox: true,
  onEdit: (node) => {
    myTree.openEditDialog({
      mode: 'edit',
      title: "編輯",
      node: node,
      texts: {
        id: "Id",
        text: "內容",
        save: "儲存",
        close: "取消",
        error_null: "請填寫此選項。"
      },
      onSave: function(dialog, formData) {
        node.text = formData.text;
        let isSuccess = myTree.updateNode(node);
        return isSuccess;
      },
    });
  },
  // onAdd methods
  onAdd: (node) => {
    myTree.openEditDialog({
      mode: 'add',
      title: "新增",
      node: node,
      texts: {
        id: "Id",
        text: "內容",
        save: "儲存",
        close: "取消",
        error_invalid: "此Id已重複使用",
        error_null: "請填寫此選項。"
      },
      onSave: function(dialog, formData) {
        let newNode = {
          id: formData.nid,
          text: formData.text,
          nodes: []
        }
        let parent = myTree.getNode(node.id);
        let isSuccess = myTree.addNode(parent, newNode);
        return isSuccess;
      },
    });
  },
  // onDelete methods
  onDelete: (node) => {
    myTree.openDeleteDialog({
      mode: 'delete',
      title: "刪除",
      node: node,
      texts: {
        id: "Id",
        text: "內容",
        close: "取消",
        delete: "刪除"
      },
      onSave: function(node) {
        let isSuccess = myTree.deleteNode(node);
        return isSuccess;
      },
    });
  }
});
```

## 備註

```text
```

# Options

### data

- Type: `Array`, an Array of node objects
- Default: `[]`
- note: node object:

  ```
  {id: str, text: str, nodes: [] }
  ```

  至少要有id和text兩個key，子物件要放在nodes裡面。
  如果傳入的data有這三項key以外的key，在建構tree時會一律放在 `except`的key下面。

### texts.treeTitle

- Type: `String`
- Default: `null`
- note: 表單的標題

### texts.selectText

- Type: `String`
- Default: `null`
- note: 表單的標題

### showAdd

- Type: `Boolean`
- Default: `False`
- note: 是否顯示 [新增 icon]

### showEdit

- Type: `Boolean`
- Default: `False`
- note: 是否顯示 [編輯 icon]

### showDelete

- Type: `Boolean`
- Default: `False`
- note: 是否顯示 [刪除 icon]

### showCheckbox

- Type: `Boolean`
- Default: `True`
- note: 是否顯示 [Ckeck box icon]

### selectedBackColor

- Type: `String`
- Default: `"#2796DB"`
- note: selected node的背景顏色

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

### select(id)

Select Node by Id

- **id**
  -Type: `String`

### unselect(id)

Unselect Node by Id

- **id**
  -Type: `String`

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

### getSelectedTags()

Get Selected Tags, Ingore Mother-Child Repeataion

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
    node: {
      id: {String},
      text: {String},
      nodes: {Array}
    },
    texts: {
      id: {String},
      text: {String},
      save: {String},
      close: {String},
      error_invalid: {String},
      error_null: {String}
    }
    valid: {
      rules: {
        [name]: {String},
        // nid_edit: "required",
        // text_edit: "required"
      },
      messages: {
        [name]: {String},
        // nid_edit: newOpt.texts.error_null,
        // text_edit: newOpt.texts.error_null
      }
    }
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
    node: {
      id: {String},
      text: {String},
      nodes: {Array}
    },
    texts: {
      id: {String},
      text: {String},
      delete: {String},
      close: {String}
    }
    onSave: {function}
  }
  ```

### updateNode(node)

Update Node / 編輯此node

- **node**
  - Type: `Object`
  - note: 傳入編輯後的新資料，並依照固定的node id 去找到舊的node進行更新
- **return**
  - Type: `Boolean`
  - note: whether this update is successful or not

### addNode(parent, newNode)

Add Node / 在parent node 下新增 new Node

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

Delete Node / 刪除此node

- **node**
  - Type: `Object`
- **return**
  - Type: `Boolean`
  - note: whether this deletion is successful or not

## 瀏覽器支援

- ### Chrome (latest)

- ### Firefox (latest)

- ### ? ~~Safari (latest)~~

- ### ? ~~Opera (latest)~~

- ### Edge (latest)

- ### ~~Internet Explorer 11~~
