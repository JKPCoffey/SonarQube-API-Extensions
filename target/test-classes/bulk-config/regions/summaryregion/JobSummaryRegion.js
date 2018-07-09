define([
    'jscore/core',
    './JobSummaryRegionView',
    'i18n!bulkimportlib/dictionary.json',
    'widgets/Tabs',
    '../detailstab/DetailsTabRegion',
    '../overviewtab/OverviewTabRegion',
    'widgets/InlineMessage'

], function(core, view, i18n, Tabs, DetailsTabRegion, OverviewTabRegion, InlineMessage) {

    return core.Region.extend({

        View: view,

        init: function() {

            this.detailsTabRegion = new DetailsTabRegion({
                context: this.getContext()
            });

            this.overviewTabRegion = new OverviewTabRegion({
                context: this.getContext()
            });

            this.tabsWidget = new Tabs({
                showAddButton: false,
                tabs: [
                    {title: i18n.jobSummary.details.title, content: this.detailsTabRegion},
                    {title: i18n.jobSummary.overview.title, content: this.overviewTabRegion}
                ]
            });
        },

        onStart: function() {
            this.addEventHandlers();
        },

        onStop: function() {

        },

        onViewReady: function() {
            this.showErrorMessage();
        },

        addEventHandlers: function() {
            this.getEventBus().subscribe('jobsummary:checkedRow', function(checkedRows, selectedIds) {
                if (checkedRows[0] !== this.jobSummary) {
                    this.jobSummary = checkedRows[0];
                    if (this.jobSummary) {
                        var tabsHeight = this.view.getSelectedHolder().getNative().offsetHeight + 45 + 'px';
                        this.tabsWidget.setContentHeight('calc(100% - ' + tabsHeight + ')');
                        this.tabsWidget.attachTo(this.view.getTabs());
                        this.showAttributesPanel(this.jobSummary);
                        this.removeErrorMessage();
                    } else {
                        if (selectedIds.length < 1) {
                            this.showErrorMessage();
                        }
                    }
                }
            }.bind(this));
        },

        showAttributesPanel: function(job) {
            this.view.getSelectedNameHolder().setText(job.name);
            this.overviewTabRegion.updateTabView(job);
            this.detailsTabRegion.updateTabView(job);
        },

        clearAttributesPanel: function() {
            this.view.getSelectedHolder().setModifier('hide');
            this.view.getSelectedNameHolder().setText('');
            this.view.getSelectedTypeHolder().setText('');
            this.tabsWidget.detach(this.view.getTabs());
        },

        showMessageArea: function(obj, icon) {
            obj = obj || {};
            icon = icon || 'infoMsgIndicator';

            if (this.errorMessage) {
                this.errorMessage.destroy();
            }

            this.errorMessage = new InlineMessage({
                header: obj.title,
                description: obj.message,
                icon: icon
            });

            this.errorMessage.attachTo(this.view.getJobSummaryMessageArea());
        },

        showErrorMessage: function() {
            this.clearAttributesPanel();
            this.showMessageArea({
                title: i18n.jobSummary.emptyJobDetails,
                message: i18n.jobSummary.noJobSelected
            });
        },

        removeErrorMessage: function() {
            this.errorMessage.detach(this.view.getJobSummaryMessageArea());
        }
    });
});
