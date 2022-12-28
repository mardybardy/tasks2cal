/*{
    "type": "action",
    "targets": ["omnifocus"],
    "identifier": "dev.rcarr.tasks2cal",
    "author": "Rob Carr",
    "version": "1.0.2",
    "description": "Tasks2Calendar"
}*/
(() => {
    const action = new PlugIn.Action( function(selection) {
        (async () => {
            const formLib = this.FormLib;
            const calLib = this.CalLib;
            const taskLib = this.TaskLib;

            const form = formLib.getForm();
            await form.show(formLib.C.FORM_TITLE, formLib.C.CONFIRM_TITLE);
            formLib.savePreferences(form);

            const tasks = taskLib.getTasksList(selection);
            const taskDurationCutoff = taskLib.getTaskDurationCutoff(tasks, form, formLib, calLib);

            let date = form.values.startDate;
            
            for (
                let i = 0;
                i < tasks.length && date;
                i++
            ) {
                const task = tasks[i];
                const url = URL.fromString(calLib.getCalStr(task, date, form, formLib, taskDurationCutoff));

                url.open();
                date = calLib.getNextDate(task, date, form, formLib, taskDurationCutoff);
            }
        })().catch(err => console.error(err.message, err.stack));
    });

    action.validate = function(selection) {
        return selection.tasks.length > 0 
        || selection.projects.length > 0 
        || selection.tags.length > 0;
    }

    return action
})()