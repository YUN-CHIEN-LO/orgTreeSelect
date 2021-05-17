import { tmpl, assign } from './lib.js';
import DEFAULTS from './default.js';
import methods from './methods.js';
import { EDIT_DIALOGTMP, DELETE_DIALOGTMP } from './templates.js';
import Tree from './bootstrap-treeview-module.js';
class OrgTreeSelect {

    /**
     * Constructor
     * @param {Sting} elem #tree 
     * @param {Obj} options 
     */
    constructor(elem, options) {

        this.t = null;

        // Options
        this.options = assign({}, DEFAULTS, $.isPlainObject(options) && options);



        // 此plugin鑲嵌的DOM
        this.elem = elem;
        // 此plugin中，鑲嵌tree的DOM
        this.treeElem = `${elem}Tree`;
        // 此plugin中，鑲嵌tagbox的DOM
        this.tagboxElem = `${elem}Tagboxs`;

        // Array: 紀錄實際要回傳的nodes
        this.returnItem = [];
        // Array: 紀錄在確認之前，select的nodes
        this.selectItem = [];

        this.init(this.options);
        this.bindEvent();
    };

    //#region tree 動作

    /**
     * 當點選tag時，取消選取相對應的node
     * @param {String} nodeId 
     * @param {DOM} element 
     */
    unselectThisBtn(nodeId, element) {

        // 取得相對應的node
        let item = this.selectItem.filter(i => {
            return i.nodeId == nodeId;
        });

        // 取消選取
        this.unSelectThisNode(item[0]);

        // 移除tag DOM element
        element.remove();

        // 更新selected item array
        this.pushSelected();
    };

    /**
     * append tags DOM
     * @param {Obj} data node物件 
     */
    appendSelect(data) {
        $(this.tagboxElem).append(
            `<span class='btn btn-primary selectedItem' nodeId="${data.nodeId}" >${data.text}</span>`
        );
        this.selectItem.push(data);
    };

    /**
     * 將以選取的node已tag形式，加到tagBox中
     */
    pushSelected() {

        // tree DOM id
        let ele = this.treeElem;

        // 清空 tagbox DOM element
        $(this.tagboxElem).empty();

        // get seleted nodes
        let arr = this.t.getSelected();

        // 清空 selectItem
        this.selectItem = [];

        arr.forEach((item) => {

            // 取得母物件
            let thisParent = this.t.getParent(item);

            // 若母物件存在且不為root
            if (thisParent && thisParent["state"]) {

                // 若母物件尚未被選取
                if (thisParent.state.selected == false) {
                    this.appendSelect(item);
                }
            } else {
                this.appendSelect(item);
            }
            // 換言之，若此node的母物件已經被選取，則不需要將此node push進tagbox

        });
    };

    /**
     * select
     * @param {Obj} data node物件
     */
    selectThisNode(data) {

        // tree DOM id
        let ele = this.treeElem;

        // select this node
        this.t.selectNode(data.nodeId, { silent: true });
        // check this node
        this.t.checkNode(data.nodeId, { silent: true });

        // 指向這個node的子物件
        let childData = data.nodes;

        // 當選取此物件，其底下的子物件也要一併選取
        while (1) {
            if (childData) {
                childData.forEach((item) => {
                    // 遞迴
                    this.selectThisNode(item);
                });
            }
            break;
        }
    };

    /**
     * unselect
     * @param {Obj} data node物件 
     */
    unSelectThisNode(data) {

        // tree DOM id
        let ele = this.treeElem;

        // unselect this node
        this.t.unselectNode(data.nodeId, { silent: true });
        // uncheck this node
        this.t.uncheckNode(data.nodeId, { silent: true });

        // 指向這個node的子物件
        let childData = data.nodes;
        // 指向這個node的母物件
        let parentData = data;

        // 當取消選取此物件，其底下的子物件也要一併取消選取
        while (1) {
            if (childData) {
                childData.forEach((item) => {
                    // 遞迴
                    this.unSelectThisNode(item);
                });
            }
            break;
        }

        // 當取消選取此物件，其母物件被選取，同樣需要取消選取
        while (1) {

            // 指向其母物件
            let thisParent = this.t.getParent(parentData);

            // 若母物件存在且不為root
            if (thisParent && thisParent["state"]) {

                // 若母物件被打勾
                if (thisParent.state.checked == true) {

                    // unselect 母物件
                    this.t.unselectNode(thisParent.nodeId, { silent: true });
                    // uncheck 子物件
                    this.t.uncheckNode(thisParent.nodeId, { silent: true });

                    // 將指標向上指
                    parentData = thisParent;
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    };

    /**
     * 展開/收合 node
     * @param {Obj} data node物件 
     */
    toggleExpandThisNode(data) {

        // tree DOM id
        let ele = this.treeElem;

        // 讓node保持點選前select的狀態
        if (data.state.checked) {
            // 若此node被打勾，則選取此node
            this.t.selectNode(data.nodeId, { silent: true });
        } else {
            // 若此node沒有被打勾，則取消選取此node
            this.t.unselectNode(data.nodeId, { silent: true });
        }

        // 進行 展開/收合 動作
        if (data.state.expanded) {
            // 若此node已展開，則收合此node
            this.t.collapseNode(data.nodeId, { silent: true, ignoreChildren: false });
        } else {
            // 若此node以收合，則展開此node
            this.t.expandNode(data.nodeId, { levels: 1, silent: true });
        }
    };
    //#endregion

    /**
     * Find Node
     * @param {Object} root 
     * @param {String} id 
     * @returns {Object} node
     */
    findNode(root, id) {
        var stack = [],
            node, ii;
        stack.push(root);

        while (stack.length > 0) {
            node = stack.pop();
            if (node.id == id) {
                // Found it!
                return node;
            } else if (node.nodes && node.nodes.length) {
                for (ii = 0; ii < node.nodes.length; ii += 1) {
                    stack.push(node.nodes[ii]);
                }
            }
        }

        // Didn't find it. Return null.
        return null;
    };

    /**
     * add cdn script
     */
    // addScript(src) {
    //     var s = document.createElement('script');
    //     s.setAttribute('src', src);
    //     document.body.appendChild(s);
    // };

    /**
     * bind events
     */
    bindEvent() {


        // 內部指標
        let _this = this;

        // include cdn
        // _this.options.cdnUrl.forEach((x) => {
        //     _this.addScript(x);
        // });

        // 套用 plugin css styles
        $(_this.elem).addClass("orgTreeSelect");

        // 點選tags
        $(document).on('click', `.selectedItem`, function(event) {

            //get node id
            let tmpNodeId = event.target.getAttribute("nodeId");

            // 如果點選tags，則unselect相對應物件，並移除tags
            _this.unselectThisBtn(tmpNodeId, event.target);

        });

        // 點選modal確認
        $(document).on('click', `${_this.elem}ModalSubmit`, function() {

            // 更新return item list
            _this.returnItem = _this.selectItem;


            if (_this.returnItem.length > 0) {

                // 宣告回傳字串
                let str = "";
                _this.returnItem.forEach((item) => {
                    str += `${item.text}, `;
                });

                // 更新回傳字串(移除string後面的', ')
                $(`${_this.elem}ModalBtn > p`).text(str.slice(0, -2));

            } else {

                // 若沒有tags要回傳，設回傳字串為default
                $(`${_this.elem}ModalBtn > p`).text(_this.options.texts.selectText);

            }
        });



        // 關閉modal
        $(document).on('click', `.${_this.elem.substring(1)}ModalCancel`, function() {

            // 取消modal操作的話，需要無視此次開啟modal時所有的select/unselect操作，

            // unselect all nodes
            if (_this.selectItem.length > 0) {
                _this.selectItem.forEach((item) => {
                    _this.unSelectThisNode(item);
                });
            }

            // 清空 放tags的 DOM
            $(_this.tagboxElem).empty();

            if (_this.returnItem.length > 0) {

                // 宣告回傳字串
                let str = "";

                _this.returnItem.forEach((item) => {

                    // 建構回傳字串
                    str += `${item.text}, `;

                    // select this node
                    _this.selectThisNode(item);

                    // push tags into tagbox
                    $(_this.tagboxElem).append(
                        `<span class='btn btn-primary selectedItem' nodeId="${item.nodeId}">${item.text}</span>`
                    );

                });

                // 更新回傳字串(移除string後面的', ')
                $(`${_this.elem}ModalBtn > p`).text(str.slice(0, -2));

            } else {

                // 若沒有tags要回傳，設回傳字串為default
                $(`${_this.elem}ModalBtn > p`).text(_this.options.texts.selectText);

            }
        });
    };

    /**
     * Show Edit Dialog
     * @param {Obj} options 
     */
    showEditDialog(options = {}) {
        const DIALOGDEFAULT = {
            // 操作模式: add|edit
            mode: 'add',
            // 標題
            title: '',
            // 表單資料
            node: {
                id: '',
                text: '',
                nodes: []
            },
            // 儲存按鈕的callback
            onSave: null,
        };

        const newOpt = assign({}, DIALOGDEFAULT, $.isPlainObject(options) && options);



        BootstrapDialog.show({
            title: newOpt.title,
            buttons: [{
                    id: 'close',
                    label: 'Close',
                    cssClass: 'btn-light',
                    action: function(dialog) {
                        dialog.close();
                    },
                },
                {
                    id: 'save',
                    label: 'Save',
                    cssClass: 'btn-primary',
                    action: function(dialog) {

                        console.log(jQuery.isFunction(newOpt.onSave));
                        if (jQuery.isFunction(newOpt.onSave)) {

                            // set form validation
                            let form = "form[name='nform-edit']";
                            $(form).validate({
                                rules: {
                                    nid: "required",
                                    text: "required",
                                },
                                messages: {
                                    nid: "Please enter your node id",
                                    text: "Please enter your node text",
                                },
                            });

                            // set form submit actions
                            $("#nform-edit").submit((event) => {
                                event.preventDefault();

                                // if form is valid
                                if ($(form).valid()) {
                                    const formData = {
                                        nid: dialog.initSelector.$nid.val(),
                                        text: dialog.initSelector.$text.val(),
                                    };

                                    // onSave callback
                                    let success = newOpt.onSave(dialog, formData);
                                    if (success) {
                                        // if success, close dialog
                                        dialog.close();
                                    } else {
                                        console.log("if fail, show error");
                                        // if fail, show error
                                        $("#nid-edit-error").css('display', 'inline-block');
                                        $("#nid-edit-error").text("Please use an unique Id");
                                        $("#nid-edit").focus();
                                    }
                                }

                            });

                            // submit
                            $(form).submit();

                        }
                    },
                },
            ],
            onshow: function(dialog) {
                const modalBody = dialog.getModalBody();

                // use edit template
                dialog.templateForm = tmpl(EDIT_DIALOGTMP);

                dialog.initSelector = {
                    $nid: dialog.templateForm.find('#nid-edit'),
                    $text: dialog.templateForm.find('#text-edit'),
                };

                switch (newOpt.mode) {
                    // 新增
                    case 'add':
                        dialog.initSelector.$nid.prop('disabled', false);
                        dialog.initSelector.$nid.val('');
                        dialog.initSelector.$text.val('');
                        break;
                        // 修改
                    case 'edit':
                        dialog.initSelector.$nid.prop('disabled', true);
                        dialog.initSelector.$nid.val(newOpt.node.id);
                        dialog.initSelector.$text.val(newOpt.node.text);
                        break;
                }

                modalBody.append(dialog.templateForm);
            },
        }).setType(BootstrapDialog.TYPE_DEFAULT);
    };

    /**
     * Show Delete Dialog
     * @param {Object} options 
     */
    showDeleteDialog(options = {}) {
        const DIALOGDEFAULT = {
            // 操作模式: add|edit
            mode: 'delete',
            // 標題
            title: '',
            // 表單資料
            node: {
                id: '',
                text: '',
                nodes: []
            },
            // 儲存按鈕的callback
            onSave: null,
        };

        const newOpt = assign({}, DIALOGDEFAULT, $.isPlainObject(options) && options);

        BootstrapDialog.show({
            title: newOpt.title,
            buttons: [{
                    id: 'close',
                    label: 'Close',
                    cssClass: 'btn-light',
                    action: function(dialog) {
                        dialog.close();
                    },
                },
                {
                    id: 'delete',
                    label: 'Delete',
                    cssClass: 'btn-danger',
                    action: function(dialog) {
                        if ($.isFunction(newOpt.onSave)) {

                            // set form submit actions
                            let form = "form[name='nform-delete']";
                            $(form).submit((event) => {
                                event.preventDefault();

                                // onSave callBack
                                let success = newOpt.onSave(options.node);
                                if (success) {
                                    // if success, close dialog
                                    dialog.close();
                                } else {
                                    console.log("error")
                                }
                            });

                            // submit
                            $(form).submit();

                        }

                    },
                },
            ],
            onshow: function(dialog) {
                const modalBody = dialog.getModalBody();

                // use delete template
                dialog.templateForm = tmpl(DELETE_DIALOGTMP);

                dialog.initSelector = {
                    $nid: dialog.templateForm.find('#nid-delete'),
                    $text: dialog.templateForm.find('#text-delete'),
                };

                switch (newOpt.mode) {
                    case 'delete':
                        dialog.initSelector.$nid.text(newOpt.node.id);
                        dialog.initSelector.$text.text(newOpt.node.text);
                        break;
                }

                modalBody.append(dialog.templateForm);
            },
        }).setType(BootstrapDialog.TYPE_DEFAULT);
    }

    checkDataValidation(data) {
        data.forEach((node) => {
            let idFlag = true;
            let textFlag = true;
            let otherFlag = false;
            let otherKey = [];
            Object.keys(node).forEach(key => {
                if (key == 'id') {
                    idFlag = false;
                } else if (key == 'text') {
                    textFlag = false;
                } else if (key == 'nodes') {
                    let tmpNodes = this.checkDataValidation(node.nodes);
                    node.nodes = tmpNodes;
                } else {
                    otherFlag = true;
                    if (!node["except"]) {
                        node.except = [];
                    }
                    var innerObj = {};
                    innerObj[key] = node[key];
                    node.except.push(innerObj)
                    otherKey.push(key);
                    delete node[key];
                }
            });
            if (idFlag) {
                console.log(`error: Missing key [id].`);
                // console.log(`error: Invalid Data Format`);
            }
            if (textFlag) {
                console.log(`error: Missing key [text].`);
                // console.log(`error: Invalid Data Format`);
            }
            if (otherFlag) {
                // console.log(`error: Invalid key: [${otherKey}].`);
                console.log(`warning: Invalid Data Format`);
            }
        });
        return data;
    }

    /**
     * 初始化
     * @param {Obj} options 
     */
    init(options) {
        // 清空DOM元件
        $(this.elem).empty();

        // 指定Title
        this.treeTitle = options.treeTitle;

        // 要嵌入的DOM
        let tmpHtml = `
        <!-- select btn -->
        <a  class="selectBtn" id="${this.elem.substring(1)}ModalBtn" data-toggle="modal" data-target="${this.elem}Modal">
            <p>${this.options.texts.selectText}</p>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="0.8em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1024 1280"><path d="M1011 480q0 13-10 23L535 969q-10 10-23 10t-23-10L23 503q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393l393-393q10-10 23-10t23 10l50 50q10 10 10 23z" fill="#626262"/></svg>
        </a>
        <!-- modal -->
        <div class="modal fade" id="${this.elem.substring(1)}Modal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close ${this.elem.substring(1)}ModalCancel"  data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">${this.options.texts.treeTitle}</h4>
                    </div>
                    <div class="modal-body">
                        <!-- tag box -->
                        <div  id='${this.tagboxElem.substring(1)}' class="tagBoxs"></div>
                        <!-- select -->
                        <div id='${this.treeElem.substring(1)}'></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default ${this.elem.substring(1)}ModalCancel" data-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="${this.elem.substring(1)}ModalSubmit" data-toggle="modal" data-target="${this.elem}Modal">確定</button>
                    </div>
                </div>
            </div>
        </div>

        `;
        $(this.elem).append(tmpHtml);


        // ----- 建構tree -----

        // 內部指標
        let _this = this;

        let _data = this.checkDataValidation(options.data);

        // 使用 bootstrap-treeview plugin
        this.t = new Tree(this.treeElem, {

            // 指定data
            data: _data,
            // 開啟重複選取
            multiSelect: true,
            // 開啟checkbox
            showCheckbox: options.showCheckbox,
            // 開啟新增
            showAdd: options.showAdd,
            // 開啟編輯
            showEdit: options.showEdit,
            // 開啟刪除
            showDelete: options.showDelete,


            // 當node被選取
            onNodeSelected: function(event, data) {
                // 若select，則展開
                _this.toggleExpandThisNode(data);
            },

            // 當node被取消選取
            onNodeUnselected: function(event, data) {
                // 若unselect，則收合
                _this.toggleExpandThisNode(data);
            },

            // 當node被打勾
            onNodeChecked: function(event, data) {
                // 若check，則select
                _this.selectThisNode(data);
                // push selected tags into array
                _this.pushSelected();
            },

            // 當node被取消打勾
            onNodeUnchecked: function(event, data) {
                // 若uncheck，則unselect
                _this.unSelectThisNode(data);
                // push selected tags into array
                _this.pushSelected();
            },

            // 編輯Node
            onNodeEdit: function(event, data) {
                if ($.isFunction(_this.options.onEdit)) {
                    _this.options.onEdit(data);
                }
            },

            // 新增子Node
            onNodeAdd: function(event, data) {
                if ($.isFunction(_this.options.onAdd)) {
                    _this.options.onAdd(data);
                }
            },

            // 刪除Node
            onNodeDelete: function(event, data) {
                if ($.isFunction(_this.options.onDelete)) {
                    _this.options.onDelete(data);
                }
            }
        });

        this.t.collapseAll({ silent: true });

    };
}


assign(OrgTreeSelect.prototype, methods);
export default OrgTreeSelect;