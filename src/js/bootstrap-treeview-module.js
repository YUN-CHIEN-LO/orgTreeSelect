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

    color: undefined, // '#000000',
    backColor: undefined, // '#FFFFFF',
    borderColor: undefined, // '#dddddd',
    onhoverColor: '#F5F5F5',
    selectedColor: '#FFFFFF',
    selectedBackColor: '#428bca',
    searchResultColor: '#D9534F',
    searchResultBackColor: undefined, //'#FFFFFF',

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
    onNodeDelete: undefined,
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

        this.css = '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}'



        this.init(options);

    };

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
        }

        let newId = 0;
        this.nodes.forEach(item => {
            if (item.nodeId > newId) newId = item.nodeId;
        });
        node.nodeId = newId + 1;
        this.nodes.push(node);

        if (!node.nodes) node.nodes = [];
        let index = this.nodes.findIndex((x) => x.nodeId == opt.p.nodeId);
        this.nodes[index].nodes.push(node);
        return node;
    };
    popNode(opt) {

        let index_p = this.nodes.findIndex(x => x.nodeId === opt.p.nodeId);
        let index_p_ = this.nodes[index_p].nodes.findIndex(x => x.nodeId === opt.n.nodeId);
        let index = this.nodes.findIndex(x => x.nodeId === opt.n.nodeId);

        if (opt.n.nodes) {
            opt.n.nodes.forEach((x) => {
                this.popNode({ p: opt.n, n: x });
            });
        }

        this.nodes[index_p].nodes.splice(index_p_, 1);
        this.nodes.splice(index, 1);
    };
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
        this.setInitialStates({ nodes: this.tree }, 0);
        this.render();
    };
    remove() {
        this.destroy();
        $.removeData(this, pluginName);
        $('#' + this.styleId).remove();
    };
    destroy() {

        if (!this.initialized) return;

        this.$wrapper.remove();
        this.$wrapper = null;

        // Switch off events
        this.unsubscribeEvents();

        // Reset this.initialized flag
        this.initialized = false;
    };
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
    };

    subscribeEvents() {

        this.unsubscribeEvents();

        this.$element.on('click', $.proxy(this.clickHandler, this));

        if (typeof(this.options.onNodeChecked) === 'function') {
            this.$element.on('nodeChecked', this.options.onNodeChecked);
        }

        if (typeof(this.options.onNodeCollapsed) === 'function') {
            this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
        }

        if (typeof(this.options.onNodeDisabled) === 'function') {
            this.$element.on('nodeDisabled', this.options.onNodeDisabled);
        }

        if (typeof(this.options.onNodeEnabled) === 'function') {
            this.$element.on('nodeEnabled', this.options.onNodeEnabled);
        }

        if (typeof(this.options.onNodeExpanded) === 'function') {
            this.$element.on('nodeExpanded', this.options.onNodeExpanded);
        }

        if (typeof(this.options.onNodeSelected) === 'function') {
            this.$element.on('nodeSelected', this.options.onNodeSelected);
        }

        if (typeof(this.options.onNodeUnchecked) === 'function') {
            this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
        }

        if (typeof(this.options.onNodeUnselected) === 'function') {
            this.$element.on('nodeUnselected', this.options.onNodeUnselected);
        }

        if (typeof(this.options.onSearchComplete) === 'function') {
            this.$element.on('searchComplete', this.options.onSearchComplete);
        }

        if (typeof(this.options.onSearchCleared) === 'function') {
            this.$element.on('searchCleared', this.options.onSearchCleared);
        }

        if (typeof(this.options.onNodeEdit) === 'function') {
            this.$element.on('nodeEdit', this.options.onNodeEdit);
        }

        if (typeof(this.options.onNodeAdd) === 'function') {
            this.$element.on('nodeAdd', this.options.onNodeAdd);
        }

        if (typeof(this.options.onNodeDelete) === 'function') {
            this.$element.on('nodeDelete', this.options.onNodeDelete);
        }
    };

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
            node.nodeId = _this.nodes.length;

            // parentId : transversing up the tree
            node.parentId = parent.nodeId;

            // if not provided set selectable default value
            if (!node.hasOwnProperty('selectable')) {
                node.selectable = true;
            }

            // where provided we should preserve states
            node.state = node.state || {};

            // set checked state; unless set always false
            if (!node.state.hasOwnProperty('checked')) {
                node.state.checked = false;
            }

            // set enabled state; unless set always false
            if (!node.state.hasOwnProperty('disabled')) {
                node.state.disabled = false;
            }

            // set expanded state; if not provided based on levels
            if (!node.state.hasOwnProperty('expanded')) {
                if (!node.state.disabled &&
                    (level < _this.options.levels) &&
                    (node.nodes && node.nodes.length > 0)) {
                    node.state.expanded = true;
                } else {
                    node.state.expanded = false;
                }
            }

            // set selected state; unless set always false
            if (!node.state.hasOwnProperty('selected')) {
                node.state.selected = false;
            }

            // index nodes in a flattened structure for use later
            _this.nodes.push(node);

            // recurse child nodes and transverse the tree
            if (node.nodes) {
                _this.setInitialStates(node, level);
            }
        });
    };
    clickHandler(event) {

        if (!this.options.enableLinks) event.preventDefault();

        var target = $(event.target);

        var node = this.findNode(target);
        if (!node || node.state.disabled) return;

        var classList = target.attr('class') ? target.attr('class').split(' ') : [];
        if ((classList.indexOf('expand-icon') !== -1)) {

            this.toggleExpandedState(node, _default.options);
            this.render();
        } else if ((classList.indexOf('check-icon') !== -1)) {

            this.toggleCheckedState(node, _default.options);
            this.render();
        } else if ((classList.indexOf('edit-icon') !== -1)) {
            this.setEdit(node, _default.options);
            this.render();
        } else if ((classList.indexOf('add-icon') !== -1)) {
            this.setAdd(node, _default.options);
            this.render();
        } else if ((classList.indexOf('delete-icon') !== -1)) {
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
    };
    // Looks up the DOM for the closest parent list item to retrieve the
    // data attribute nodeid, which is used to lookup the node in the flattened structure.
    findNode(target) {
        var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
        let index = this.nodes.findIndex((x) => x.nodeId == nodeId);
        var node = this.nodes[index];

        if (!node) {
            console.log('Error: node does not exist');
        }
        return node;
    };

    toggleExpandedState(node, options) {
        if (!node) return;
        this.setExpandedState(node, !node.state.expanded, options);
    };

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
            }

            // Collapse child nodes
            if (node.nodes && !options.ignoreChildren) {
                $.each(node.nodes, $.proxy(function(index, node) {
                    this.setExpandedState(node, false, options);
                }, this));
            }
        }
    };

    toggleSelectedState(node, options) {
        if (!node) return;
        this.setSelectedState(node, !node.state.selected, options);
    };

    setSelectedState(node, state, options) {

        if (state === node.state.selected) return;

        if (state) {

            // If multiSelect false, unselect previously selected
            if (!this.options.multiSelect) {
                $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function(index, node) {
                    this.setSelectedState(node, false, options);
                }, this));
            }

            // Continue selecting node
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
    };

    toggleCheckedState(node, options) {
        if (!node) return;
        this.setCheckedState(node, !node.state.checked, options);
    };

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
    };

    setEdit(node, options) {

        if (!options.silent) {
            this.$element.trigger('nodeEdit', $.extend(true, {}, node));
        }

    };

    setAdd(node, options) {

        if (!options.silent) {
            this.$element.trigger('nodeAdd', $.extend(true, {}, node));
        }

    };

    setDelete(node, options) {

        if (!options.silent) {
            this.$element.trigger('nodeDelete', $.extend(true, {}, node));
        }

    };

    setDisabledState(node, state, options) {

        if (state === node.state.disabled) return;

        if (state) {

            // Disable node
            node.state.disabled = true;

            // Disable all other states
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
    };

    render() {

        if (!this.initialized) {

            // Setup first time only components
            this.$element.addClass(pluginName);
            this.$wrapper = $(this.template.list);

            this.injectStyle();

            this.initialized = true;
        }

        this.$element.empty().append(this.$wrapper.empty());

        // Build tree
        this.buildTree(this.tree, 0);
    };

    // Starting from the root node, and recursing down the
    // structure we build the tree one node at a time
    buildTree(nodes, level) {
        if (!nodes) return;
        level += 1;

        var _this = this;
        $.each(nodes, function addNodes(id, node) {
            var treeItem = $(_this.template.item)
                .addClass('node-' + _this.elementId)
                .addClass(node.state.checked ? 'node-checked' : '')
                .addClass(node.state.disabled ? 'node-disabled' : '')
                .addClass(node.state.selected ? 'node-selected' : '')
                .addClass(node.searchResult ? 'search-result' : '')
                .attr('data-nodeid', node.nodeId)
                .attr('style', _this.buildStyleOverride(node));

            // Add indent/spacer to mimic tree structure
            for (var i = 0; i < (level - 1); i++) {
                treeItem.append(_this.template.indent);
            }

            // Add expand, collapse or empty spacer icons
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

            treeItem
                .append($(_this.template.icon)
                    .addClass(classList.join(' '))
                );


            // Add node icon
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

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }


            // Add text
            if (_this.options.enableLinks) {
                // Add hyperlink
                treeItem
                    .append($(_this.template.link)
                        .attr('href', node.href)
                        .append(node.text)
                    );
            } else {
                // otherwise just text
                treeItem
                    .append(node.text);
            }

            // Add Delete icon
            if (_this.options.showDelete) {

                var classList = ['delete-icon'];
                classList.push(_this.options.deleteIcon);

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add Edit icon
            if (_this.options.showEdit) {

                var classList = ['edit-icon'];
                classList.push(_this.options.editIcon);

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add Add icon
            if (_this.options.showAdd) {

                var classList = ['add-icon'];
                classList.push(_this.options.addIcon);

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }



            // Add tags as badges
            if (_this.options.showTags && node.tags) {
                $.each(node.tags, function addTag(id, tag) {
                    treeItem
                        .append($(_this.template.badge)
                            .append(tag)
                        );
                });
            }

            // Add item to the tree
            _this.$wrapper.append(treeItem);

            // Recursively add child ndoes
            if (node.nodes && node.state.expanded && !node.state.disabled) {
                return _this.buildTree(node.nodes, level);
            }
        });
    };

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

        return 'color:' + color +
            ';background-color:' + backColor + ';';
    };

    // Add inline style into head
    injectStyle() {

        if (this.options.injectStyle && !document.getElementById(this.styleId)) {
            $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
        }
    };

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
            style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
                'background-color:' + this.options.onhoverColor + ';' +
                '}';
        }

        return this.css + style;
    };


    /**
    	Returns a single node object that matches the given node id.
    	@param {Number} nodeId - A node's unique identifier
    	@return {Object} node - Matching node
    */
    getNode(nodeId) {
        let index = this.nodes.findIndex((x) => x.nodeId == nodeId);
        return this.nodes[index];
    };

    /**
    	Returns the parent node of a given node, if valid otherwise returns undefined.
    	@param {Object|Number} identifier - A valid node or node id
    	@returns {Object} node - The parent node
    */
    getParent(identifier) {
        var node = this.identifyNode(identifier);
        let index = this.nodes.findIndex((x) => x.nodeId == node.parentId);
        return this.nodes[index];
    };

    /**
    	Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
    	@param {Object|Number} identifier - A valid node or node id
    	@returns {Array} nodes - Sibling nodes
    */
    getSiblings(identifier) {
        var node = this.identifyNode(identifier);
        var parent = this.getParent(node);
        var nodes = parent ? parent.nodes : this.tree;
        return nodes.filter(function(obj) {
            return obj.nodeId !== node.nodeId;
        });
    };

    /**
    	Returns an array of selected nodes.
    	@returns {Array} nodes - Selected nodes
    */
    getSelected() {
        return this.findNodes('true', 'g', 'state.selected');
    };

    /**
    	Returns an array of unselected nodes.
    	@returns {Array} nodes - Unselected nodes
    */
    getUnselected() {
        return this.findNodes('false', 'g', 'state.selected');
    };

    /**
    	Returns an array of expanded nodes.
    	@returns {Array} nodes - Expanded nodes
    */
    getExpanded() {
        return this.findNodes('true', 'g', 'state.expanded');
    };

    /**
    	Returns an array of collapsed nodes.
    	@returns {Array} nodes - Collapsed nodes
    */
    getCollapsed() {
        return this.findNodes('false', 'g', 'state.expanded');
    };

    /**
    	Returns an array of checked nodes.
    	@returns {Array} nodes - Checked nodes
    */
    getChecked() {
        return this.findNodes('true', 'g', 'state.checked');
    };

    /**
    	Returns an array of unchecked nodes.
    	@returns {Array} nodes - Unchecked nodes
    */
    getUnchecked() {
        return this.findNodes('false', 'g', 'state.checked');
    };

    /**
    	Returns an array of disabled nodes.
    	@returns {Array} nodes - Disabled nodes
    */
    getDisabled() {
        return this.findNodes('true', 'g', 'state.disabled');
    };

    /**
    	Returns an array of enabled nodes.
    	@returns {Array} nodes - Enabled nodes
    */
    getEnabled() {
        return this.findNodes('false', 'g', 'state.disabled');
    };


    /**
    	Set a node state to selected
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    selectNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setSelectedState(node, true, options);
        }, this));

        this.render();
    };

    /**
    	Set a node state to unselected
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    unselectNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setSelectedState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Toggles a node selected state; selecting if unselected, unselecting if selected.
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    toggleNodeSelected(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleSelectedState(node, options);
        }, this));

        this.render();
    };


    /**
    	Collapse all tree nodes
    	@param {optional Object} options
    */
    collapseAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.expanded');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Collapse a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    collapseNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

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
            this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
                this.setExpandedState(node, true, options);
            }, this));
        }

        this.render();
    };

    /**
    	Expand a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    expandNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, true, options);
            if (node.nodes && (options && options.levels)) {
                this.expandLevels(node.nodes, options.levels - 1, options);
            }
        }, this));

        this.render();
    };

    expandLevels(nodes, level, options) {
        options = $.extend({}, _default.options, options);

        $.each(nodes, $.proxy(function(index, node) {
            this.setExpandedState(node, (level > 0) ? true : false, options);
            if (node.nodes) {
                this.expandLevels(node.nodes, level - 1, options);
            }
        }, this));
    };

    /**
    	Reveals a given tree node, expanding the tree from node to root.
    	@param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    revealNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            var parentNode = this.getParent(node);
            while (parentNode) {
                this.setExpandedState(parentNode, true, options);
                parentNode = this.getParent(parentNode);
            };
        }, this));

        this.render();
    };

    /**
    	Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    toggleNodeExpanded(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleExpandedState(node, options);
        }, this));

        this.render();
    };


    /**
    	Check all tree nodes
    	@param {optional Object} options
    */
    checkAll(options) {
        var identifiers = this.findNodes('false', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
    	Check a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    checkNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
    	Uncheck all tree nodes
    	@param {optional Object} options
    */
    uncheckAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Uncheck a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    uncheckNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Toggles a nodes checked state; checking if unchecked, unchecking if checked.
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    toggleNodeChecked(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleCheckedState(node, options);
        }, this));

        this.render();
    };


    editNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setEdit(node, options);
        }, this));

        this.render();
    };

    addNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setAdd(node, options);
        }, this));

        this.render();
    };

    deleteNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDelete(node, options);
        }, this));

        this.render();
    };


    /**
    	Disable all tree nodes
    	@param {optional Object} options
    */
    disableAll(options) {
        var identifiers = this.findNodes('false', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
    	Disable a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    disableNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
    	Enable all tree nodes
    	@param {optional Object} options
    */
    enableAll(options) {
        var identifiers = this.findNodes('true', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Enable a given tree node
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    enableNode(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
    	Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
    	@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
    	@param {optional Object} options
    */
    toggleNodeDisabled(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, !node.state.disabled, options);
        }, this));

        this.render();
    };


    /**
    	Common code for processing multiple identifiers
    */
    forEachIdentifier(identifiers, options, callback) {

        options = $.extend({}, _default.options, options);

        if (!(identifiers instanceof Array)) {
            identifiers = [identifiers];
        }

        $.each(identifiers, $.proxy(function(index, identifier) {
            callback(this.identifyNode(identifier), options);
        }, this));
    };

    /*
    	Identifies a node from either a node id or object
    */
    identifyNode(identifier) {
        return ((typeof identifier) === 'number') ?
            this.nodes[this.nodes.findIndex((x) => x.nodeId == identifier)] :
            identifier;
    };

    /**
    	Searches the tree for nodes (text) that match given criteria
    	@param {String} pattern - A given string to match against
    	@param {optional Object} options - Search criteria options
    	@return {Array} nodes - Matching nodes
    */
    search(pattern, options) {
        options = $.extend({}, _default.searchOptions, options);

        this.clearSearch({ render: false });

        var results = [];
        if (pattern && pattern.length > 0) {

            if (options.exactMatch) {
                pattern = '^' + pattern + '$';
            }

            var modifier = 'g';
            if (options.ignoreCase) {
                modifier += 'i';
            }

            results = this.findNodes(pattern, modifier);

            // Add searchResult property to all matching nodes
            // This will be used to apply custom styles
            // and when identifying result to be cleared
            $.each(results, function(index, node) {
                node.searchResult = true;
            })
        }

        // If revealResults, then render is triggered from revealNode
        // otherwise we just call render.
        if (options.revealResults) {
            this.revealNode(results);
        } else {
            this.render();
        }

        this.$element.trigger('searchComplete', $.extend(true, {}, results));

        return results;
    };

    /**
    	Clears previous search results
    */
    clearSearch(options) {

        options = $.extend({}, { render: true }, options);

        var results = $.each(this.findNodes('true', 'g', 'searchResult'), function(index, node) {
            node.searchResult = false;
        });

        if (options.render) {
            this.render();
        }

        this.$element.trigger('searchCleared', $.extend(true, {}, results));
    };

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
        return $.grep(this.nodes, function(node) {
            var val = _this.getNodeValue(node, attribute);
            if (typeof val === 'string') {
                return val.match(new RegExp(pattern, modifier));
            }
        });
    };

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
    };
}

var logError = function(message) {
    if (window.console) {
        window.console.error(message);
    }
};

// Prevent against multiple instantiations,
// handle updates and method calls
$.fn[pluginName] = function(options, args) {

    var result;

    this.each(function() {
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

export default Tree;