(() => {
    const action = new PlugIn.Action( function(selection) {
        (async () => {
            getUrls = (params) => {
                const { form: { values: { startDate }}} = params;

                const urls = [];
                let date = startDate;

                for (
                    let i = 0;
                    i < tasks.length && date;
                    i++
                ) {
                    params.task = tasks[i];
                    params.date = date
        
                    const str = calLib.getCalStr(params)

                    urls.push(URL.fromString(str));

                    date = calLib.getNextDate(params);
                }

                return urls;
            }

            callUrls = (urls) => {
                const urlsIter = urls[Symbol.iterator]();

                function callUrl(urlsIter) {
                    const next = urlsIter.next();

                    if (!next.done) {
                        next.value.call(() => callUrl(urlsIter));
                    }
                }

                callUrl(urlsIter);
            }

            openUrls = (urls) => urls.forEach((url) => url.open());

            const formLib = this.FormLib;
            const calLib = this.CalLib;
            const taskLib = this.TaskLib;

            const { C: { 
                FORM_TITLE, 
                CONFIRM_TITLE, 
                UNESTIMATED: { TASK }}
            } = formLib;

            const form = formLib.getForm();
            await form.show(FORM_TITLE, CONFIRM_TITLE);
            
            formLib.savePreferences(form);

            const tasks = taskLib.getTasks(selection, form, formLib);
            const taskDurationCutoff = taskLib.getTaskDurationCutoff(tasks, form, formLib, calLib);
            const params = { tasks, form, formLib, taskDurationCutoff };
            const urls = getUrls(params);

            if (form.values.unestimated === TASK.index) {
                const unestimated = taskLib.getUnestimatedTasks(selection, form, formLib);
                params.date = undefined;
                
                for (const task of unestimated) {
                    params.task = task;

                    const str = calLib.getCalStr(params)

                    urls.push(URL.fromString(str));
                }
            }

            const urlFn = Device.current.iOS ? callUrls : openUrls
            
            urlFn(urls);
        })().catch(err => console.error(err.message, err.stack));
    });

    action.validate = function(selection) {
        return selection.tasks.length > 0 
        || selection.projects.length > 0 
        || selection.tags.length > 0;
    }

    return action
})();
               