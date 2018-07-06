define([
    'jscore/core',
    './CollectionFromFileResultDetailsView',
    'widgets/Button',
    'tablelib/Table',
    'tablelib/plugins/FixedHeader',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/SmartTooltips',
    'i18n!networkexplorerlib/collectionfromfileresultdetails.json'
], function (core, View, Button, Table, FixedHeader, ResizableHeader, SmartTooltips, strings) {

    /**
     * This Widget is used to show detailed results in case after an operation of adding objects from a file to a collection
     * some of these objects are successfully added, while others are not added due to some kind of failure.
     * In this case a summary of the Total, Added and Failed objects is shown, followed by a list of the failed object names.
     *
     * @options
     *   {String} fileName - the name of the file which contains the objects to be inserted in a collection.
     *   {Integer} added - the number of objects that were successfully added to a collection.
     *   {Integer} failed - the number of objects that for some reason (e.g. invalid or duplicated)
     *   weren't added to a collection.
     *
     * @class CollectionCreatorFromFile
     */
    return core.Widget.extend({

        View: this.view,

        /**
         * Lifecycle method
         */
        view: function () {
            return new View({
                total: this.options.added + this.options.failed,
                added: this.options.added,
                failed: this.options.failed
            });
        },

        /**
         * Invokes the creation and display of the Table and Export Button Widgets.
         */
        onViewReady: function () {
            this.createAndShowExportButton();
            this.createAndShowTable();
        },

        /**
         * Creates an Export Button Widget. When pressed, it allows to create and save a file containing
         * the names/FDNs of the objects that couldn't be added to a collection during an operation
         * of adding objects from a file to a new or an existing collection.
         *
         * @private
         * @method createAndShowExportButton
         */
        createAndShowExportButton: function() {

            this.exportButton = new Button({
                caption: strings.get('export'),
                icon: {
                    name: 'export',
                    position: 'left'
                },
                modifiers: [{
                    name: 'small'
                }]
            });

            this.exportButton.addEventHandler('click', this.exportFailures.bind(this));
            this.exportButton.attachTo(this.view.getExportButton());
        },

        /**
         * Create Table Widget and attach to DOM.
         *
         * @private
         * @method createAndShowTable
         */
        createAndShowTable: function() {

            this.table = new Table({
                plugins: [
                    new FixedHeader({height: "165px"}),
                    new ResizableHeader(),
                    new SmartTooltips()],
                modifiers: [
                    {name: 'striped'}
                ],
                data: this.options.failures,
                columns: [
                    {title: strings.get('name'), attribute: 'name', resizable: true},
                    {title: strings.get('reason'), attribute: 'reason', resizable: true}
                ]
            });

            this.table.attachTo(this.view.getTableHolder());
        },

        /**
         * Creates and saves a file containing all objects that weren't added to a collection
         * (due to their invalid or duplicated name or FDN)
         * during an "Add Objects to a Collection from a File" or "Create a Collection from a File" operations.
         *
         * @private
         * @method exportFailures
         */
        exportFailures: function () {
            var exportFailuresData = [];
            var separator = '|';
            exportFailuresData.push('sep=' + separator + '\n');
            exportFailuresData.push('Name' + separator + "Reason" + '\n');
            Array.prototype.push.apply(
                exportFailuresData,
                this.options.failures.map(function(failure) {
                    return failure.name + separator + failure.reason +'\n';
                })
            );

            var exportRef = this.view.getExportRef();
            var file = new Blob(exportFailuresData, {type: 'text/plain'});
            var nowDateStr = new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, "");

            exportRef.setAttribute("href", window.URL.createObjectURL(file));

            var exportFileName = "FailedObjects_" + nowDateStr + "_" + this.options.fileName;

            if (!exportFileName.endsWith('.csv')) {
                if (exportFileName.endsWith('.txt')) {
                    exportFileName = exportFileName.substring( 0, exportFileName.indexOf('.txt'));
                }
                exportFileName = exportFileName + '.csv';
            }

            exportRef.setAttribute("download", exportFileName);
            exportRef.trigger("click");
        }
    });
});