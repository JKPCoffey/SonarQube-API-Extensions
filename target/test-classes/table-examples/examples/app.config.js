define({
    script: 'examples/Examples',
    i18n: {
        locales: ['en-us', 'fr', 'it']
    },
    children: [
        // basics
        {app: 'simple-table'},
        {app: 'sortable-table'},
        {app: 'fixed-header-table'},
        {app: 'resizable-columns-table'},
        {app: 'custom-cell-table'},
        {app: 'color-band-table'},
        {app: 'simple-selection-table'},
        {app: 'expandable-row-table'},
        {app: 'simple-table-settings'},
        {app: 'pinned-column-table'},
        {app: 'paginated-table-layout'},
        // intermediate
        {app: 'paginated-table'},
        {app: 'tree-table'},
        {app: 'filterable-table'},
        {app: 'quick-filter-table'},
        {app: 'filterable-table-advanced'},
        // advanced
        {app: 'drilldown-table'},
        {app: 'virtual-scroll-table'}
    ]
});
