(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OrgTreePopover = factory());
}(this, (function () { 'use strict';

    /**
     * Extend object
     * @param {*} target - The target object to extend.
     * @param {*} args - The rest objects for merging to the target object.
     * @returns {Object} The extended object.
     */
    const assign = Object.assign || function assign(target, ...args) {
      if ($.isPlainObject(target) && args.length > 0) {
        args.forEach(arg => {
          if ($.isPlainObject(arg)) {
            Object.keys(arg).forEach(key => {
              target[key] = arg[key];
            });
          }
        });
      }

      return target;
    };
    /**
     * Template
     * @param {object} el
     * @param {array} data - template render data
     * @param {function} created - callback method
     * @return {element}
     */

    function tmpl(el, data, created) {
      const $el = $(el);
      let templateHTML = /script|template/i.test($el.prop('tagName')) ? $el.html() : $el.prop('outerHTML');
      let $compiledEl = $((templateHTML || '').replace(/{{ *(.*?) *}}/g, (match, p1) => {
        try {
          return [data || {}].concat(p1.split('.')).reduce((a, b) => {
            return a[b];
          }) || '';
        } catch (e) {
          return '';
        }
      }));

      if (typeof created === 'function') {
        created($compiledEl, data);
      }

      return $compiledEl;
    }

    var DEFAULTS = {
      data: [],
      treeTitle: "",
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showCheckbox: true,
      onAdd: null,
      onEdit: null,
      onDelete: null
    };

    var methods = {
      /**
       * set Options
       * @param {Obj} options 
       */
      setOptions(options = {}) {
        this.options = assign({}, this.options, $.isPlainObject(options) && options);
        this.init(this.options);
      },

      /**
       * get node
       * @param {String} id 
       * @returns {Obj} node obj
       */
      getNode(id) {
        this.treeElem;
        let root = this.t.getNode(0);
        let node = this.findNode(root, id);
        if (node) return node;else return -1;
      },

      /**
       * get Parent
       * @param {String} id
       * @return {Obj} node Obj
       */
      getParent(id) {
        let node = this.getNode(id);

        if (node.parentId >= 0) {
          this.treeElem;
          let parent = this.t.getParent(node);
          return parent;
        } else {
          return -1;
        }
      },

      /**
       * get Siblings
       * @param {String} id
       * @return {Array} an array of node Obj
       */
      getSiblings(id) {
        let node = this.getNode(id);
        this.treeElem;
        let siblings = this.t.getSiblings(node);
        return siblings;
      },

      /**
       * get Childs
       * @param {String} id
       * @return {Array} an array of node Obj
       */
      getChilds(id) {
        let node = this.getNode(id);
        return node.nodes;
      },

      /**
       * get Selected Tags
       * @param {String} id
       * @return {Array} an array of node Obj
       */
      getSelectedTags() {
        let arr = [];
        this.returnItem.forEach(item => {
          arr.push(item.id);
        });
        return this.returnItem;
      },

      /**
       * get All Selected Nodes
       * @param {String} id
       * @return {Array} an array of node Obj
       */
      getSelected() {
        this.treeElem;
        let selected = this.t.getSelected();
        return selected;
      },

      /**
       * get All Unselected Nodes
       * @param {String} id
       * @return {Array} an array of node Obj
       */
      getUnselected() {
        this.treeElem;
        let selected = this.t.getUnselected();
        return selected;
      },

      /**
       * open edit dialog
       * @param {Object} options 
       */
      openEditDialog(options = {}) {
        this.showEditDialog(options);
      },

      /**
       * open delete dialog
       * @param {Object} options 
       */
      openDeleteDialog(options = {}) {
        this.showDeleteDialog(options);
      },

      /**
       * Update Node
       * @param {Object} node 
       * @returns {Boolean} if this update is successful or not
       */
      updateNode(node) {
        try {
          // 指向DOM
          let ele = this.treeElem; // 更新node

          let tmp = this.getNode(node.id);
          tmp.text = node.text; // 更新 selected tag

          $(`[nodeid="${node.nodeId}"]`).text(tmp.text); // 重新渲染

          this.t.render();
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },

      /**
       * AddNode
       * @param {Object} node 
       * @returns {Boolean} if this addition is successful or not
       */
      addNode(parent, newNode) {
        // 指向DOM
        this.treeElem;

        try {
          // push node
          // - return -1 : this id has already exist
          // - return node obj : successfully pushed
          let node = this.t.pushNode({
            p: parent,
            n: newNode
          });

          if (node == -1) {
            return false;
          } else {
            // 重新渲染
            this.t.render(); // 展開

            this.t.expandNode(parent.nodeId, {
              levels: 1,
              silent: true
            }); // 如果parent是selected，新增的node也要select起來

            if (parent.state.selected) {
              this.t.selectNode(node.nodeId, {
                silent: true
              });
              this.t.checkNode(node.nodeId, {
                silent: true
              });
            }

            return true;
          }
        } catch (error) {
          console.log(error);
          return false;
        }
      },

      /**
       * Delete Node
       * @param {Object} node 
       * @returns {Boolean} if this deletion is successful or not
       */
      deleteNode(node) {
        // 指向DOM
        this.treeElem;

        try {
          if (node.nodeId) {
            let parent = this.t.getNode(node.parentId); // pop node

            this.t.popNode({
              p: parent,
              n: node
            }); // 重新渲染

            this.t.render();
            this.pushSelected();
          } else {
            alert("無法刪除root!");
          }
        } catch (error) {
          console.log(error);
          return false;
        }

        return true;
      }

    };

    const EDIT_DIALOGTMP = `<script id="tmpl-edit-form-dialog" type="text/template">
<div id="edit-form-dialog">
  <form name="nform-edit" id="nform-edit">
  <div class="form-group">
      <label for="nid-edit">Id:</label>
      <input type="text" class="form-control" id="nid-edit" name="nid-edit" required>
      <label id="nid-edit-error" class="error" for="nid-edit"></label>
    </div>
    <div class="form-group">
      <label for="text">Text:</label>
      <input type="text" class="form-control" id="text-edit" name="text-edit" required>
      <label id="text-edit-error" class="error" for="text-edit"></label>
    </div>
  </form>
</div>
</script>`;
    const DELETE_DIALOGTMP = `<script id="tmpl-delete-form-dialog" type="text/template">
<div id="delete-form-dialog">
  <form name="nform-delete" id="nform-delete">
  <div class="form-group">
      <label for="nid-delete">Id:</label>
      <p id="nid-delete" name="nid-delete"></p>
      <label id="nid-delete-error" class="error" for="nid-delete"></label>
    </div>
    <div class="form-group">
      <label for="text">Text:</label>
      <p id="text-delete" name="text-delete"></p>
      <label id="text-delete-error" class="error" for="text-delete"></label>
    </div>
  </form>
</div>
</script>`;

    var pluginName = 'treeview';
    var _default = {};
    _default.settings = {
      injectStyle: true,
      levels: 2,
      expandIcon: 'glyphicon glyphicon-chevron-down',
      collapseIcon: 'glyphicon glyphicon-chevron-up',
      emptyIcon: 'glyphicon',
      nodeIcon: '',
      selectedIcon: '',
      checkedIcon: 'glyphicon glyphicon-check',
      uncheckedIcon: 'glyphicon glyphicon-unchecked',
      editIcon: 'glyphicon glyphicon-pencil',
      deleteIcon: 'glyphicon glyphicon-remove',
      addIcon: 'glyphicon glyphicon-plus',
      color: undefined,
      // '#000000',
      backColor: undefined,
      // '#FFFFFF',
      borderColor: undefined,
      // '#dddddd',
      onhoverColor: '#F5F5F5',
      selectedColor: '#FFFFFF',
      selectedBackColor: '#428bca',
      searchResultColor: '#D9534F',
      searchResultBackColor: undefined,
      //'#FFFFFF',
      enableLinks: false,
      highlightSelected: true,
      highlightSearchResults: true,
      showBorder: true,
      showIcon: true,
      showCheckbox: false,
      showEdit: true,
      showAdd: true,
      showDelete: true,
      showTags: false,
      multiSelect: false,
      // Event handlers
      onNodeChecked: undefined,
      onNodeCollapsed: undefined,
      onNodeDisabled: undefined,
      onNodeEnabled: undefined,
      onNodeExpanded: undefined,
      onNodeSelected: undefined,
      onNodeUnchecked: undefined,
      onNodeUnselected: undefined,
      onSearchComplete: undefined,
      onSearchCleared: undefined,
      onNodeEdit: undefined,
      onNodeAdd: undefined,
      onNodeDelete: undefined
    };
    _default.options = {
      silent: false,
      ignoreChildren: false
    };
    _default.searchOptions = {
      ignoreCase: true,
      exactMatch: false,
      revealResults: true
    };

    class Tree {
      constructor(element, options) {
        this.$element = $(element);
        this.elementId = element.id;
        this.styleId = this.elementId + '-style';
        this.template = {
          list: '<ul class="list-group"></ul>',
          item: '<li class="list-group-item"></li>',
          indent: '<span class="indent"></span>',
          icon: '<span class="icon"></span>',
          link: '<a href="#" style="color:inherit;"></a>',
          badge: '<span class="badge"></span>'
        };
        this.css = '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}';
        this.init(options);
      }

      pushNode(opt) {
        if (this.nodes.some(item => item.id === opt.n.id)) {
          console.log('Error: id already exsit.');
          return -1;
        }

        let node = {
          id: opt.n.id,
          nodeId: null,
          parentId: opt.p.nodeId,
          selectable: true,
          state: {
            checked: false,
            disabled: false,
            expanded: false,
            selected: false
          },
          text: opt.n.text
        };
        let newId = 0;
        this.nodes.forEach(item => {
          if (item.nodeId > newId) newId = item.nodeId;
        });
        node.nodeId = newId + 1;
        this.nodes.push(node);
        if (!node.nodes) node.nodes = [];
        let index = this.nodes.findIndex(x => x.nodeId == opt.p.nodeId);
        this.nodes[index].nodes.push(node);
        return node;
      }

      popNode(opt) {
        let index_p = this.nodes.findIndex(x => x.nodeId === opt.p.nodeId);
        let index_p_ = this.nodes[index_p].nodes.findIndex(x => x.nodeId === opt.n.nodeId);
        let index = this.nodes.findIndex(x => x.nodeId === opt.n.nodeId);

        if (opt.n.nodes) {
          opt.n.nodes.forEach(x => {
            this.popNode({
              p: opt.n,
              n: x
            });
          });
        }

        this.nodes[index_p].nodes.splice(index_p_, 1);
        this.nodes.splice(index, 1);
      }

      init(options) {
        this.tree = [];
        this.nodes = [];

        if (options.data) {
          if (typeof options.data === 'string') {
            options.data = $.parseJSON(options.data);
          }

          this.tree = $.extend(true, [], options.data);
          delete options.data;
        }

        this.options = $.extend({}, _default.settings, options);
        this.destroy();
        this.subscribeEvents();
        this.setInitialStates({
          nodes: this.tree
        }, 0);
        this.render();
      }

      remove() {
        this.destroy();
        $.removeData(this, pluginName);
        $('#' + this.styleId).remove();
      }

      destroy() {
        if (!this.initialized) return;
        this.$wrapper.remove();
        this.$wrapper = null; // Switch off events

        this.unsubscribeEvents(); // Reset this.initialized flag

        this.initialized = false;
      }

      unsubscribeEvents() {
        this.$element.off('click');
        this.$element.off('nodeChecked');
        this.$element.off('nodeCollapsed');
        this.$element.off('nodeDisabled');
        this.$element.off('nodeEnabled');
        this.$element.off('nodeExpanded');
        this.$element.off('nodeSelected');
        this.$element.off('nodeUnchecked');
        this.$element.off('nodeUnselected');
        this.$element.off('searchComplete');
        this.$element.off('searchCleared');
        this.$element.off('nodeEdit');
        this.$element.off('nodeAdd');
        this.$element.off('nodeDelete');
      }

      subscribeEvents() {
        this.unsubscribeEvents();
        this.$element.on('click', $.proxy(this.clickHandler, this));

        if (typeof this.options.onNodeChecked === 'function') {
          this.$element.on('nodeChecked', this.options.onNodeChecked);
        }

        if (typeof this.options.onNodeCollapsed === 'function') {
          this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
        }

        if (typeof this.options.onNodeDisabled === 'function') {
          this.$element.on('nodeDisabled', this.options.onNodeDisabled);
        }

        if (typeof this.options.onNodeEnabled === 'function') {
          this.$element.on('nodeEnabled', this.options.onNodeEnabled);
        }

        if (typeof this.options.onNodeExpanded === 'function') {
          this.$element.on('nodeExpanded', this.options.onNodeExpanded);
        }

        if (typeof this.options.onNodeSelected === 'function') {
          this.$element.on('nodeSelected', this.options.onNodeSelected);
        }

        if (typeof this.options.onNodeUnchecked === 'function') {
          this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
        }

        if (typeof this.options.onNodeUnselected === 'function') {
          this.$element.on('nodeUnselected', this.options.onNodeUnselected);
        }

        if (typeof this.options.onSearchComplete === 'function') {
          this.$element.on('searchComplete', this.options.onSearchComplete);
        }

        if (typeof this.options.onSearchCleared === 'function') {
          this.$element.on('searchCleared', this.options.onSearchCleared);
        }

        if (typeof this.options.onNodeEdit === 'function') {
          this.$element.on('nodeEdit', this.options.onNodeEdit);
        }

        if (typeof this.options.onNodeAdd === 'function') {
          this.$element.on('nodeAdd', this.options.onNodeAdd);
        }

        if (typeof this.options.onNodeDelete === 'function') {
          this.$element.on('nodeDelete', this.options.onNodeDelete);
        }
      }

      /*
      Recurse the tree structure and ensure all nodes have
      valid initial states.  User defined states will be preserved.
      For performance we also take this opportunity to
      index nodes in a flattened structure
      */
      setInitialStates(node, level) {
        if (!node.nodes) return;
        level += 1;
        var parent = node;

        var _this = this;

        $.each(node.nodes, function checkStates(index, node) {
          // nodeId : unique, incremental identifier
          node.nodeId = _this.nodes.length; // parentId : transversing up the tree

          node.parentId = parent.nodeId; // if not provided set selectable default value

          if (!node.hasOwnProperty('selectable')) {
            node.selectable = true;
          } // where provided we should preserve states


          node.state = node.state || {}; // set checked state; unless set always false

          if (!node.state.hasOwnProperty('checked')) {
            node.state.checked = false;
          } // set enabled state; unless set always false


          if (!node.state.hasOwnProperty('disabled')) {
            node.state.disabled = false;
          } // set expanded state; if not provided based on levels


          if (!node.state.hasOwnProperty('expanded')) {
            if (!node.state.disabled && level < _this.options.levels && node.nodes && node.nodes.length > 0) {
              node.state.expanded = true;
            } else {
              node.state.expanded = false;
            }
          } // set selected state; unless set always false


          if (!node.state.hasOwnProperty('selected')) {
            node.state.selected = false;
          } // index nodes in a flattened structure for use later


          _this.nodes.push(node); // recurse child nodes and transverse the tree


          if (node.nodes) {
            _this.setInitialStates(node, level);
          }
        });
      }

      clickHandler(event) {
        if (!this.options.enableLinks) event.preventDefault();
        var target = $(event.target);
        var node = this.findNode(target);
        if (!node || node.state.disabled) return;
        var classList = target.attr('class') ? target.attr('class').split(' ') : [];

        if (classList.indexOf('expand-icon') !== -1) {
          this.toggleExpandedState(node, _default.options);
          this.render();
        } else if (classList.indexOf('check-icon') !== -1) {
          this.toggleCheckedState(node, _default.options);
          this.render();
        } else if (classList.indexOf('edit-icon') !== -1) {
          this.setEdit(node, _default.options);
          this.render();
        } else if (classList.indexOf('add-icon') !== -1) {
          this.setAdd(node, _default.options);
          this.render();
        } else if (classList.indexOf('delete-icon') !== -1) {
          this.setDelete(node, _default.options);
          this.render();
        } else {
          if (node.selectable) {
            this.toggleSelectedState(node, _default.options);
          } else {
            this.toggleExpandedState(node, _default.options);
          }

          this.render();
        }
      }

      // Looks up the DOM for the closest parent list item to retrieve the
      // data attribute nodeid, which is used to lookup the node in the flattened structure.
      findNode(target) {
        var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
        let index = this.nodes.findIndex(x => x.nodeId == nodeId);
        var node = this.nodes[index];

        if (!node) {
          console.log('Error: node does not exist');
        }

        return node;
      }

      toggleExpandedState(node, options) {
        if (!node) return;
        this.setExpandedState(node, !node.state.expanded, options);
      }

      setExpandedState(node, state, options) {
        if (state === node.state.expanded) return;

        if (state && node.nodes) {
          // Expand a node
          node.state.expanded = true;

          if (!options.silent) {
            this.$element.trigger('nodeExpanded', $.extend(true, {}, node));
          }
        } else if (!state) {
          // Collapse a node
          node.state.expanded = false;

          if (!options.silent) {
            this.$element.trigger('nodeCollapsed', $.extend(true, {}, node));
          } // Collapse child nodes


          if (node.nodes && !options.ignoreChildren) {
            $.each(node.nodes, $.proxy(function (index, node) {
              this.setExpandedState(node, false, options);
            }, this));
          }
        }
      }

      toggleSelectedState(node, options) {
        if (!node) return;
        this.setSelectedState(node, !node.state.selected, options);
      }

      setSelectedState(node, state, options) {
        if (state === node.state.selected) return;

        if (state) {
          // If multiSelect false, unselect previously selected
          if (!this.options.multiSelect) {
            $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function (index, node) {
              this.setSelectedState(node, false, options);
            }, this));
          } // Continue selecting node


          node.state.selected = true;

          if (!options.silent) {
            this.$element.trigger('nodeSelected', $.extend(true, {}, node));
          }
        } else {
          // Unselect node
          node.state.selected = false;

          if (!options.silent) {
            this.$element.trigger('nodeUnselected', $.extend(true, {}, node));
          }
        }
      }

      toggleCheckedState(node, options) {
        if (!node) return;
        this.setCheckedState(node, !node.state.checked, options);
      }

      setCheckedState(node, state, options) {
        if (state === node.state.checked) return;

        if (state) {
          // Check node
          node.state.checked = true;

          if (!options.silent) {
            this.$element.trigger('nodeChecked', $.extend(true, {}, node));
          }
        } else {
          // Uncheck node
          node.state.checked = false;

          if (!options.silent) {
            this.$element.trigger('nodeUnchecked', $.extend(true, {}, node));
          }
        }
      }

      setEdit(node, options) {
        if (!options.silent) {
          this.$element.trigger('nodeEdit', $.extend(true, {}, node));
        }
      }

      setAdd(node, options) {
        if (!options.silent) {
          this.$element.trigger('nodeAdd', $.extend(true, {}, node));
        }
      }

      setDelete(node, options) {
        if (!options.silent) {
          this.$element.trigger('nodeDelete', $.extend(true, {}, node));
        }
      }

      setDisabledState(node, state, options) {
        if (state === node.state.disabled) return;

        if (state) {
          // Disable node
          node.state.disabled = true; // Disable all other states

          this.setExpandedState(node, false, options);
          this.setSelectedState(node, false, options);
          this.setCheckedState(node, false, options);

          if (!options.silent) {
            this.$element.trigger('nodeDisabled', $.extend(true, {}, node));
          }
        } else {
          // Enabled node
          node.state.disabled = false;

          if (!options.silent) {
            this.$element.trigger('nodeEnabled', $.extend(true, {}, node));
          }
        }
      }

      render() {
        if (!this.initialized) {
          // Setup first time only components
          this.$element.addClass(pluginName);
          this.$wrapper = $(this.template.list);
          this.injectStyle();
          this.initialized = true;
        }

        this.$element.empty().append(this.$wrapper.empty()); // Build tree

        this.buildTree(this.tree, 0);
      }

      // Starting from the root node, and recursing down the
      // structure we build the tree one node at a time
      buildTree(nodes, level) {
        if (!nodes) return;
        level += 1;

        var _this = this;

        $.each(nodes, function addNodes(id, node) {
          var treeItem = $(_this.template.item).addClass('node-' + _this.elementId).addClass(node.state.checked ? 'node-checked' : '').addClass(node.state.disabled ? 'node-disabled' : '').addClass(node.state.selected ? 'node-selected' : '').addClass(node.searchResult ? 'search-result' : '').attr('data-nodeid', node.nodeId).attr('style', _this.buildStyleOverride(node)); // Add indent/spacer to mimic tree structure

          for (var i = 0; i < level - 1; i++) {
            treeItem.append(_this.template.indent);
          } // Add expand, collapse or empty spacer icons


          var classList = [];

          if (node.nodes && node.nodes.length > 0) {
            classList.push('expand-icon');

            if (node.state.expanded) {
              classList.push(_this.options.collapseIcon);
            } else {
              classList.push(_this.options.expandIcon);
            }
          } else {
            classList.push(_this.options.emptyIcon);
          }

          treeItem.append($(_this.template.icon).addClass(classList.join(' '))); // Add node icon
          // if (_this.options.showIcon) {
          //     var classList = ['node-icon'];
          //     classList.push(node.icon || _this.options.nodeIcon);
          //     if (node.state.selected) {
          //         classList.pop();
          //         classList.push(node.selectedIcon || _this.options.selectedIcon ||
          //             node.icon || _this.options.nodeIcon);
          //     }
          //     treeItem
          //         .append($(_this.template.icon)
          //             .addClass(classList.join(' '))
          //         );
          // }
          // Add check / unchecked icon

          if (_this.options.showCheckbox) {
            var classList = ['check-icon'];

            if (node.state.checked) {
              classList.push(_this.options.checkedIcon);
            } else {
              classList.push(_this.options.uncheckedIcon);
            }

            treeItem.append($(_this.template.icon).addClass(classList.join(' ')));
          } // Add text


          if (_this.options.enableLinks) {
            // Add hyperlink
            treeItem.append($(_this.template.link).attr('href', node.href).append(node.text));
          } else {
            // otherwise just text
            treeItem.append(node.text);
          } // Add Delete icon


          if (_this.options.showDelete) {
            var classList = ['delete-icon'];
            classList.push(_this.options.deleteIcon);
            treeItem.append($(_this.template.icon).addClass(classList.join(' ')));
          } // Add Edit icon


          if (_this.options.showEdit) {
            var classList = ['edit-icon'];
            classList.push(_this.options.editIcon);
            treeItem.append($(_this.template.icon).addClass(classList.join(' ')));
          } // Add Add icon


          if (_this.options.showAdd) {
            var classList = ['add-icon'];
            classList.push(_this.options.addIcon);
            treeItem.append($(_this.template.icon).addClass(classList.join(' ')));
          } // Add tags as badges


          if (_this.options.showTags && node.tags) {
            $.each(node.tags, function addTag(id, tag) {
              treeItem.append($(_this.template.badge).append(tag));
            });
          } // Add item to the tree


          _this.$wrapper.append(treeItem); // Recursively add child ndoes


          if (node.nodes && node.state.expanded && !node.state.disabled) {
            return _this.buildTree(node.nodes, level);
          }
        });
      }

      // Define any node level style override for
      // 1. selectedNode
      // 2. node|data assigned color overrides
      buildStyleOverride(node) {
        if (node.state.disabled) return '';
        var color = node.color;
        var backColor = node.backColor;

        if (this.options.highlightSelected && node.state.selected) {
          if (this.options.selectedColor) {
            color = this.options.selectedColor;
          }

          if (this.options.selectedBackColor) {
            backColor = this.options.selectedBackColor;
          }
        }

        if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
          if (this.options.searchResultColor) {
            color = this.options.searchResultColor;
          }

          if (this.options.searchResultBackColor) {
            backColor = this.options.searchResultBackColor;
          }
        }

        return 'color:' + color + ';background-color:' + backColor + ';';
      }

      // Add inline style into head
      injectStyle() {
        if (this.options.injectStyle && !document.getElementById(this.styleId)) {
          $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
        }
      }

      // Construct trees style based on user options
      buildStyle() {
        var style = '.node-' + this.elementId + '{';

        if (this.options.color) {
          style += 'color:' + this.options.color + ';';
        }

        if (this.options.backColor) {
          style += 'background-color:' + this.options.backColor + ';';
        }

        if (!this.options.showBorder) {
          style += 'border:none;';
        } else if (this.options.borderColor) {
          style += 'border:1px solid ' + this.options.borderColor + ';';
        }

        style += '}';

        if (this.options.onhoverColor) {
          style += '.node-' + this.elementId + ':not(.node-disabled):hover{' + 'background-color:' + this.options.onhoverColor + ';' + '}';
        }

        return this.css + style;
      }

      /**
      	Returns a single node object that matches the given node id.
      	@param {Number} nodeId - A node's unique identifier
      	@return {Object} node - Matching node
      */
      getNode(nodeId) {
        let index = this.nodes.findIndex(x => x.nodeId == nodeId);
        return this.nodes[index];
      }

      /**
      	Returns the parent node of a given node, if valid otherwise returns undefined.
      	@param {Object|Number} identifier - A valid node or node id
      	@returns {Object} node - The parent node
      */
      getParent(identifier) {
        var node = this.identifyNode(identifier);
        let index = this.nodes.findIndex(x => x.nodeId == node.parentId);
        return this.nodes[index];
      }

      /**
      	Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
      	@param {Object|Number} identifier - A valid node or node id
      	@returns {Array} nodes - Sibling nodes
      */
      getSiblings(identifier) {
        var node = this.identifyNode(identifier);
        var parent = this.getParent(node);
        var nodes = parent ? parent.nodes : this.tree;
        return nodes.filter(function (obj) {
          return obj.nodeId !== node.nodeId;
        });
      }

      /**
      	Returns an array of selected nodes.
      	@returns {Array} nodes - Selected nodes
      */
      getSelected() {
        return this.findNodes('true', 'g', 'state.selected');
      }

      /**
      	Returns an array of unselected nodes.
      	@returns {Array} nodes - Unselected nodes
      */
      getUnselected() {
        return this.findNodes('false', 'g', 'state.selected');
      }

      /**
      	Returns an array of expanded nodes.
      	@returns {Array} nodes - Expanded nodes
      */
      getExpanded() {
        return this.findNodes('true', 'g', 'state.expanded');
      }

      /**
      	Returns an array of collapsed nodes.
      	@returns {Array} nodes - Collapsed nodes
      */
      getCollapsed() {
        return this.findNodes('false', 'g', 'state.expanded');
      }

      /**
      	Returns an array of checked nodes.
      	@returns {Array} nodes - Checked nodes
      */
      getChecked() {
        return this.findNodes('true', 'g', 'state.checked');
      }

      /**
      	Returns an array of unchecked nodes.
      	@returns {Array} nodes - Unchecked nodes
      */
      getUnchecked() {
        return this.findNodes('false', 'g', 'state.checked');
      }

      /**
      	Returns an array of disabled nodes.
      	@returns {Array} nodes - Disabled nodes
      */
      getDisabled() {
        return this.findNodes('true', 'g', 'state.disabled');
      }

      /**
      	Returns an array of enabled nodes.
      	@returns {Array} nodes - Enabled nodes
      */
      getEnabled() {
        return this.findNodes('false', 'g', 'state.disabled');
      }

      /**
      	Set a node state to selected
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      selectNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setSelectedState(node, true, options);
        }, this));
        this.render();
      }

      /**
      	Set a node state to unselected
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      unselectNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setSelectedState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Toggles a node selected state; selecting if unselected, unselecting if selected.
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      toggleNodeSelected(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.toggleSelectedState(node, options);
        }, this));
        this.render();
      }

      /**
      	Collapse all tree nodes
      	@param {optional Object} options
      */
      collapseAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.expanded');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setExpandedState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Collapse a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      collapseNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setExpandedState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Expand all tree nodes
      	@param {optional Object} options
      */
      expandAll(options) {
        options = $.extend({}, _default.options, options);

        if (options && options.levels) {
          this.expandLevels(this.tree, options.levels, options);
        } else {
          var identifiers = this.findNodes('false', 'g', 'state.expanded');
          this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setExpandedState(node, true, options);
          }, this));
        }

        this.render();
      }

      /**
      	Expand a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      expandNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setExpandedState(node, true, options);

          if (node.nodes && options && options.levels) {
            this.expandLevels(node.nodes, options.levels - 1, options);
          }
        }, this));
        this.render();
      }

      expandLevels(nodes, level, options) {
        options = $.extend({}, _default.options, options);
        $.each(nodes, $.proxy(function (index, node) {
          this.setExpandedState(node, level > 0 ? true : false, options);

          if (node.nodes) {
            this.expandLevels(node.nodes, level - 1, options);
          }
        }, this));
      }

      /**
      	Reveals a given tree node, expanding the tree from node to root.
      	@param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      revealNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          var parentNode = this.getParent(node);

          while (parentNode) {
            this.setExpandedState(parentNode, true, options);
            parentNode = this.getParent(parentNode);
          }
        }, this));
        this.render();
      }

      /**
      	Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      toggleNodeExpanded(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.toggleExpandedState(node, options);
        }, this));
        this.render();
      }

      /**
      	Check all tree nodes
      	@param {optional Object} options
      */
      checkAll(options) {
        var identifiers = this.findNodes('false', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setCheckedState(node, true, options);
        }, this));
        this.render();
      }

      /**
      	Check a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      checkNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setCheckedState(node, true, options);
        }, this));
        this.render();
      }

      /**
      	Uncheck all tree nodes
      	@param {optional Object} options
      */
      uncheckAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setCheckedState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Uncheck a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      uncheckNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setCheckedState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Toggles a nodes checked state; checking if unchecked, unchecking if checked.
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      toggleNodeChecked(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.toggleCheckedState(node, options);
        }, this));
        this.render();
      }

      editNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setEdit(node, options);
        }, this));
        this.render();
      }

      addNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setAdd(node, options);
        }, this));
        this.render();
      }

      deleteNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDelete(node, options);
        }, this));
        this.render();
      }

      /**
      	Disable all tree nodes
      	@param {optional Object} options
      */
      disableAll(options) {
        var identifiers = this.findNodes('false', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDisabledState(node, true, options);
        }, this));
        this.render();
      }

      /**
      	Disable a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      disableNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDisabledState(node, true, options);
        }, this));
        this.render();
      }

      /**
      	Enable all tree nodes
      	@param {optional Object} options
      */
      enableAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDisabledState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Enable a given tree node
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      enableNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDisabledState(node, false, options);
        }, this));
        this.render();
      }

      /**
      	Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
      	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
      	@param {optional Object} options
      */
      toggleNodeDisabled(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
          this.setDisabledState(node, !node.state.disabled, options);
        }, this));
        this.render();
      }

      /**
      	Common code for processing multiple identifiers
      */
      forEachIdentifier(identifiers, options, callback) {
        options = $.extend({}, _default.options, options);

        if (!(identifiers instanceof Array)) {
          identifiers = [identifiers];
        }

        $.each(identifiers, $.proxy(function (index, identifier) {
          callback(this.identifyNode(identifier), options);
        }, this));
      }

      /*
      	Identifies a node from either a node id or object
      */
      identifyNode(identifier) {
        return typeof identifier === 'number' ? this.nodes[this.nodes.findIndex(x => x.nodeId == identifier)] : identifier;
      }

      /**
      	Searches the tree for nodes (text) that match given criteria
      	@param {String} pattern - A given string to match against
      	@param {optional Object} options - Search criteria options
      	@return {Array} nodes - Matching nodes
      */
      search(pattern, options) {
        options = $.extend({}, _default.searchOptions, options);
        this.clearSearch({
          render: false
        });
        var results = [];

        if (pattern && pattern.length > 0) {
          if (options.exactMatch) {
            pattern = '^' + pattern + '$';
          }

          var modifier = 'g';

          if (options.ignoreCase) {
            modifier += 'i';
          }

          results = this.findNodes(pattern, modifier); // Add searchResult property to all matching nodes
          // This will be used to apply custom styles
          // and when identifying result to be cleared

          $.each(results, function (index, node) {
            node.searchResult = true;
          });
        } // If revealResults, then render is triggered from revealNode
        // otherwise we just call render.


        if (options.revealResults) {
          this.revealNode(results);
        } else {
          this.render();
        }

        this.$element.trigger('searchComplete', $.extend(true, {}, results));
        return results;
      }

      /**
      	Clears previous search results
      */
      clearSearch(options) {
        options = $.extend({}, {
          render: true
        }, options);
        var results = $.each(this.findNodes('true', 'g', 'searchResult'), function (index, node) {
          node.searchResult = false;
        });

        if (options.render) {
          this.render();
        }

        this.$element.trigger('searchCleared', $.extend(true, {}, results));
      }

      /**
      	Find nodes that match a given criteria
      	@param {String} pattern - A given string to match against
      	@param {optional String} modifier - Valid RegEx modifiers
      	@param {optional String} attribute - Attribute to compare pattern against
      	@return {Array} nodes - Nodes that match your criteria
      */
      findNodes(pattern, modifier, attribute) {
        modifier = modifier || 'g';
        attribute = attribute || 'text';

        var _this = this;

        return $.grep(this.nodes, function (node) {
          var val = _this.getNodeValue(node, attribute);

          if (typeof val === 'string') {
            return val.match(new RegExp(pattern, modifier));
          }
        });
      }

      /**
      	Recursive find for retrieving nested attributes values
      	All values are return as strings, unless invalid
      	@param {Object} obj - Typically a node, could be any object
      	@param {String} attr - Identifies an object property using dot notation
      	@return {String} value - Matching attributes string representation
      */
      getNodeValue(obj, attr) {
        var index = attr.indexOf('.');

        if (index > 0) {
          var _obj = obj[attr.substring(0, index)];

          var _attr = attr.substring(index + 1, attr.length);

          return this.getNodeValue(_obj, _attr);
        } else {
          if (obj.hasOwnProperty(attr)) {
            return obj[attr].toString();
          } else {
            return undefined;
          }
        }
      }

    }

    var logError = function (message) {
      if (window.console) {
        window.console.error(message);
      }
    }; // Prevent against multiple instantiations,
    // handle updates and method calls


    $.fn[pluginName] = function (options, args) {
      var result;
      this.each(function () {
        var _this = $.data(this, pluginName);

        if (typeof options === 'string') {
          if (!_this) {
            logError('Not initialized, can not call method : ' + options);
          } else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
            logError('No such method : ' + options);
          } else {
            if (!(args instanceof Array)) {
              args = [args];
            }

            result = _this[options].apply(_this, args);
          }
        } else if (typeof options === 'boolean') {
          result = _this;
        } else {
          $.data(this, pluginName, new Tree(this, $.extend(true, {}, options)));
        }
      });
      return result || this;
    };

    class OrgTreePopover {
      /**
       * Constructor
       * @param {Sting} elem #tree 
       * @param {Obj} options 
       */
      constructor(elem, options) {
        this.t = null; // Options

        this.options = assign({}, DEFAULTS, $.isPlainObject(options) && options); // 此plugin鑲嵌的DOM

        this.elem = elem; // 此plugin中，鑲嵌tree的DOM

        this.treeElem = `${elem}Tree`; // 此plugin中，鑲嵌tagbox的DOM

        this.tagboxElem = `${elem}Tagboxs`; // Array: 紀錄實際要回傳的nodes

        this.returnItem = []; // Array: 紀錄在確認之前，select的nodes

        this.selectItem = [];
        this.init(this.options);
        this.bindEvent();
      }

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
        }); // 取消選取

        this.unSelectThisNode(item[0]); // 移除tag DOM element

        element.remove(); // 更新selected item array

        this.pushSelected();
      }

      /**
       * append tags DOM
       * @param {Obj} data node物件 
       */
      appendSelect(data) {
        $(this.tagboxElem).append(`<span class='btn btn-primary selectedItem' nodeId="${data.nodeId}" >${data.text}</span>`);
        this.selectItem.push(data);
      }

      /**
       * 將以選取的node已tag形式，加到tagBox中
       */
      pushSelected() {
        // tree DOM id
        this.treeElem; // 清空 tagbox DOM element

        $(this.tagboxElem).empty(); // get seleted nodes

        let arr = this.t.getSelected(); // 清空 selectItem

        this.selectItem = [];
        arr.forEach(item => {
          // 取得母物件
          let thisParent = this.t.getParent(item); // 若母物件存在且不為root

          if (thisParent && thisParent["state"]) {
            // 若母物件尚未被選取
            if (thisParent.state.selected == false) {
              this.appendSelect(item);
            }
          } else {
            this.appendSelect(item);
          } // 換言之，若此node的母物件已經被選取，則不需要將此node push進tagbox

        });
      }

      /**
       * select
       * @param {Obj} data node物件
       */
      selectThisNode(data) {
        // tree DOM id
        this.treeElem; // select this node

        this.t.selectNode(data.nodeId, {
          silent: true
        }); // check this node

        this.t.checkNode(data.nodeId, {
          silent: true
        }); // 指向這個node的子物件

        let childData = data.nodes; // 當選取此物件，其底下的子物件也要一併選取

        while (1) {
          if (childData) {
            childData.forEach(item => {
              // 遞迴
              this.selectThisNode(item);
            });
          }

          break;
        }
      }

      /**
       * unselect
       * @param {Obj} data node物件 
       */
      unSelectThisNode(data) {
        // tree DOM id
        this.treeElem; // unselect this node

        this.t.unselectNode(data.nodeId, {
          silent: true
        }); // uncheck this node

        this.t.uncheckNode(data.nodeId, {
          silent: true
        }); // 指向這個node的子物件

        let childData = data.nodes; // 指向這個node的母物件

        let parentData = data; // 當取消選取此物件，其底下的子物件也要一併取消選取

        while (1) {
          if (childData) {
            childData.forEach(item => {
              // 遞迴
              this.unSelectThisNode(item);
            });
          }

          break;
        } // 當取消選取此物件，其母物件被選取，同樣需要取消選取


        while (1) {
          // 指向其母物件
          let thisParent = this.t.getParent(parentData); // 若母物件存在且不為root

          if (thisParent && thisParent["state"]) {
            // 若母物件被打勾
            if (thisParent.state.checked == true) {
              // unselect 母物件
              this.t.unselectNode(thisParent.nodeId, {
                silent: true
              }); // uncheck 子物件

              this.t.uncheckNode(thisParent.nodeId, {
                silent: true
              }); // 將指標向上指

              parentData = thisParent;
            } else {
              return;
            }
          } else {
            return;
          }
        }
      }

      /**
       * 展開/收合 node
       * @param {Obj} data node物件 
       */
      toggleExpandThisNode(data) {
        // tree DOM id
        this.treeElem; // 讓node保持點選前select的狀態

        if (data.state.checked) {
          // 若此node被打勾，則選取此node
          this.t.selectNode(data.nodeId, {
            silent: true
          });
        } else {
          // 若此node沒有被打勾，則取消選取此node
          this.t.unselectNode(data.nodeId, {
            silent: true
          });
        } // 進行 展開/收合 動作


        if (data.state.expanded) {
          // 若此node已展開，則收合此node
          this.t.collapseNode(data.nodeId, {
            silent: true,
            ignoreChildren: false
          });
        } else {
          // 若此node以收合，則展開此node
          this.t.expandNode(data.nodeId, {
            levels: 1,
            silent: true
          });
        }
      }

      //#endregion

      /**
       * Find Node
       * @param {Object} root 
       * @param {String} id 
       * @returns {Object} node
       */
      findNode(root, id) {
        var stack = [],
            node,
            ii;
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
        } // Didn't find it. Return null.


        return null;
      }

      /**
       * bind events
       */
      bindEvent() {
        // 內部指標
        let _this = this; // 套用 plugin css styles


        $(_this.elem).addClass("orgTreePopover"); // 點選tags

        $(document).on('click', `.selectedItem`, function (event) {
          //get node id
          let tmpNodeId = event.target.getAttribute("nodeId"); // 如果點選tags，則unselect相對應物件，並移除tags

          _this.unselectThisBtn(tmpNodeId, event.target);
        }); // 點選modal確認

        $(document).on('click', `${_this.elem}ModalSubmit`, function () {
          // 更新return item list
          _this.returnItem = _this.selectItem;

          if (_this.returnItem.length > 0) {
            // 宣告回傳字串
            let str = "";

            _this.returnItem.forEach(item => {
              str += `${item.text}, `;
            }); // 更新回傳字串(移除string後面的', ')


            $(`${_this.elem}ModalBtn > p`).text(str.slice(0, -2));
          } else {
            // 若沒有tags要回傳，設回傳字串為default
            $(`${_this.elem}ModalBtn > p`).text("請選擇");
          }
        }); // 關閉modal

        $(document).on('click', `.${_this.elem.substring(1)}ModalCancel`, function () {
          // 取消modal操作的話，需要無視此次開啟modal時所有的select/unselect操作，
          // unselect all nodes
          if (_this.selectItem.length > 0) {
            _this.selectItem.forEach(item => {
              _this.unSelectThisNode(item);
            });
          } // 清空 放tags的 DOM


          $(_this.tagboxElem).empty();

          if (_this.returnItem.length > 0) {
            // 宣告回傳字串
            let str = "";

            _this.returnItem.forEach(item => {
              // 建構回傳字串
              str += `${item.text}, `; // select this node

              _this.selectThisNode(item); // push tags into tagbox


              $(_this.tagboxElem).append(`<span class='btn btn-primary selectedItem' nodeId="${item.nodeId}">${item.text}</span>`);
            }); // 更新回傳字串(移除string後面的', ')


            $(`${_this.elem}ModalBtn > p`).text(str.slice(0, -2));
          } else {
            // 若沒有tags要回傳，設回傳字串為default
            $(`${_this.elem}ModalBtn > p`).text("請選擇");
          }
        });
      }

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
          onSave: null
        };
        const newOpt = assign({}, DIALOGDEFAULT, $.isPlainObject(options) && options);
        BootstrapDialog.show({
          title: newOpt.title,
          buttons: [{
            id: 'close',
            label: 'Close123',
            cssClass: 'btn-light',
            action: function (dialog) {
              console.log("123123132");
              dialog.close();
            }
          }, {
            id: 'save',
            label: 'Save',
            cssClass: 'btn-primary',
            action: function (dialog) {
              console.log(jQuery.isFunction(newOpt.onSave));

              if (jQuery.isFunction(newOpt.onSave)) {
                // set form validation
                let form = "form[name='nform-edit']";
                $(form).validate({
                  rules: {
                    nid: "required",
                    text: "required"
                  },
                  messages: {
                    nid: "Please enter your node id",
                    text: "Please enter your node text"
                  }
                }); // set form submit actions

                $("#nform-edit").submit(event => {
                  event.preventDefault(); // if form is valid

                  if ($(form).valid()) {
                    const formData = {
                      nid: dialog.initSelector.$nid.val(),
                      text: dialog.initSelector.$text.val()
                    }; // onSave callback

                    let success = newOpt.onSave(dialog, formData);

                    if (success) {
                      // if success, close dialog
                      dialog.close();
                    } else {
                      console.log("if fail, show error"); // if fail, show error

                      $("#nid-edit-error").css('display', 'inline-block');
                      $("#nid-edit-error").text("Please use an unique Id");
                      $("#nid-edit").focus();
                    }
                  }
                }); // submit

                $(form).submit();
              }
            }
          }],
          onshow: function (dialog) {
            const modalBody = dialog.getModalBody(); // use edit template

            dialog.templateForm = tmpl(EDIT_DIALOGTMP);
            dialog.initSelector = {
              $nid: dialog.templateForm.find('#nid-edit'),
              $text: dialog.templateForm.find('#text-edit')
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
          }
        }).setType(BootstrapDialog.TYPE_DEFAULT);
      }

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
          onSave: null
        };
        const newOpt = assign({}, DIALOGDEFAULT, $.isPlainObject(options) && options);
        BootstrapDialog.show({
          title: newOpt.title,
          buttons: [{
            id: 'close',
            label: 'Close',
            cssClass: 'btn-light',
            action: function (dialog) {
              dialog.close();
            }
          }, {
            id: 'delete',
            label: 'Delete',
            cssClass: 'btn-danger',
            action: function (dialog) {
              if ($.isFunction(newOpt.onSave)) {
                // set form submit actions
                let form = "form[name='nform-delete']";
                $(form).submit(event => {
                  event.preventDefault(); // onSave callBack

                  let success = newOpt.onSave(options.node);

                  if (success) {
                    // if success, close dialog
                    dialog.close();
                  } else {
                    console.log("error");
                  }
                }); // submit

                $(form).submit();
              }
            }
          }],
          onshow: function (dialog) {
            const modalBody = dialog.getModalBody(); // use delete template

            dialog.templateForm = tmpl(DELETE_DIALOGTMP);
            dialog.initSelector = {
              $nid: dialog.templateForm.find('#nid-delete'),
              $text: dialog.templateForm.find('#text-delete')
            };

            switch (newOpt.mode) {
              case 'delete':
                dialog.initSelector.$nid.text(newOpt.node.id);
                dialog.initSelector.$text.text(newOpt.node.text);
                break;
            }

            modalBody.append(dialog.templateForm);
          }
        }).setType(BootstrapDialog.TYPE_DEFAULT);
      }

      checkDataValidation(data) {
        data.forEach(node => {
          let idFlag = true;
          let textFlag = true;
          let otherFlag = false;
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
              node.except.push(innerObj);
              delete node[key];
            }
          });

          if (idFlag) {
            // console.log(`error: Missing key [id].`);
            console.log(`error: Invalid Data Format`);
          }

          if (textFlag) {
            // console.log(`error: Missing key [text].`);
            console.log(`error: Invalid Data Format`);
          }

          if (otherFlag) {
            // console.log(`error: Invalid key: [${otherKey}].`);
            console.log(`error: Invalid Data Format`);
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
        $(this.elem).empty(); // 指定Title

        this.treeTitle = options.treeTitle; // 要嵌入的DOM

        let tmpHtml = `
        <!-- select btn -->
        <a  class="selectBtn" id="${this.elem.substring(1)}ModalBtn" data-toggle="modal" data-target="${this.elem}Modal">
            <p>請選擇</p>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="0.8em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1024 1280"><path d="M1011 480q0 13-10 23L535 969q-10 10-23 10t-23-10L23 503q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393l393-393q10-10 23-10t23 10l50 50q10 10 10 23z" fill="#626262"/></svg>
        </a>
        <!-- modal -->
        <div class="modal fade" id="${this.elem.substring(1)}Modal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close ${this.elem.substring(1)}ModalCancel"  data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">${this.options.treeTitle}</h4>
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
        $(this.elem).append(tmpHtml); // ----- 建構tree -----
        // 內部指標

        let _this = this;

        let _data = this.checkDataValidation(options.data); // 使用 bootstrap-treeview plugin


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
          onNodeSelected: function (event, data) {
            // 若select，則展開
            _this.toggleExpandThisNode(data);
          },
          // 當node被取消選取
          onNodeUnselected: function (event, data) {
            // 若unselect，則收合
            _this.toggleExpandThisNode(data);
          },
          // 當node被打勾
          onNodeChecked: function (event, data) {
            // 若check，則select
            _this.selectThisNode(data); // push selected tags into array


            _this.pushSelected();
          },
          // 當node被取消打勾
          onNodeUnchecked: function (event, data) {
            // 若uncheck，則unselect
            _this.unSelectThisNode(data); // push selected tags into array


            _this.pushSelected();
          },
          // 編輯Node
          onNodeEdit: function (event, data) {
            if ($.isFunction(_this.options.onEdit)) {
              _this.options.onEdit(data);
            }
          },
          // 新增子Node
          onNodeAdd: function (event, data) {
            if ($.isFunction(_this.options.onAdd)) {
              _this.options.onAdd(data);
            }
          },
          // 刪除Node
          onNodeDelete: function (event, data) {
            if ($.isFunction(_this.options.onDelete)) {
              _this.options.onDelete(data);
            }
          }
        });
        this.t.collapseAll({
          silent: true
        });
      }

    }

    assign(OrgTreePopover.prototype, methods);

    return OrgTreePopover;

})));
