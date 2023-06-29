IMPORTANT: I've archived this project as I'm moving from Mac to Linux, at least for a while. As such, I won't be using Omnifocus for task management anymore.



# Tasks2Cal

## Description

An Omnifocus plugin that allows you to transfer tasks from Omnifocus to BusyCal or Fantastical for timeblocking.

## Install

git clone this repository

`git clone https://github.com/feraleyebrows/tasks2cal Tasks2Cal.omnifocusjs`

Alternatively, download as a zip file, unarchive, and then rename the folder: 

`Tasks2Cal.omnifocusjs`

Once you have the file on your machine double click (or right click, open with... and select Omnifocus) and Omnifocus should automatically install it. 

If the plugin is not installed via the above method, you may have to drag it manually into the plug-ins folder. To find the location for this, open Omnifocus, click Automation in the menu bar, then click "Configure...". A pop-up window should now show up. In the bottom right hand corner there should be a button that says 'Reveal in Finder'. It may be greyed out in which case you may need to select a folder or existing plugin in the pop up window.

To check if it has been installed correctly, load Omnifocus and click 'Automation' in the menu bar and you should now see 'Tasks2Cal' as one of the options in the drop down menu.

### Optional

#### MeetingBar

This plugin pairs really well with a free app call MeetingBar. MeetingBar will display your current or next calendar event/task in your menu bar and clicking on it will then display a drop down that reveals your entire schedule for the day. As Task2Cal transfers links and MeetingBar supports them, clicking on a task in the schedule will automatically open Omnifocus at the selected task. This makes it really quick to check things off your list as well as keeping you focused on the task at hand. More information about MeetingBar can be found here:

https://meetingbar.onrender.com

#### Tim

Tim is time tracking software that lives in your menu bar and allows you to quickly switch between tasks. To enable support for Tim, first make sure you have Tim installed. Next, right click on the Tasks2Cal plugin and click "Reveal Package Contents". If you are having trouble finding the plugin, please the directions in the Install section of this ReadMe. Inside the revealed folder you should now see a list of files and folders. Find 'Add Task To Tim.shortcut' and double click it to install it to Apple Shortcuts. Please note that if you rename this Shortcut the functionality will cease to work unless you also edit the corresponding URL in the CalLib file to match the new name.

The first time you use the functionality you will be asked by Apple Shortcuts for permission to allow it to control Tim. After that it should just work automatically. For more details on how to send your tasks to Tim, please consult the 'App' and 'Also add tasks to Tim' headings in the 'Usage' section below. 

For more information on Tim visit:

https://tim.neat.software

## Usage

Select some tasks you want to add to you calendar. Then click 'Automation -> Tasks2Cal' in the menu bar. This should bring up a pop up window with the following options:

- Calendar App
- Start Date
- End Date
- Add as tasks (Not Events)
- Maximum Task Depth
- Only Include
- Default duration
- Unestimated Tasks Should Be
- If Total Task Duration Exceeds Time

It is advisable to add a tag to all of the tasks you want to add to your calendar, navigate to the tags perspective and then select that tag. This will allow you to move the tasks into the order you desire and the plugin should add them in this order.

One approach to acheive this is to create a parent tag 'This' and then seven child tags: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. This allows you to easily tag things with specific days by typing for example 'This: Monday' in the tag field or simply 'This' if you want to schedule it at some point this week but do not yet have a specific day in mind.

You can also repeat the above with a parent tag of 'Next' and the seven child tags for the days of the week. This allow you to plan out the next week as well as the current one. When the week ends you can enter the Tags perspective, drag any outstanding tasks across from 'This' into 'Next', rename the 'Next' tag 'This', and then rename the previous 'This' tag to 'Next'.

### Known Issues

- Fantastical will not recognise tasks that start with numbers. For example, a task named '100 Words' will not work but a task named 'Write 100 Words' will.

- Certain words in your task title such as 'in', 'at', 'on' or 'with' may interfere with Fantastical and BusyCal parsing your task correctly. For example 'Write Plug In For Omnifocus' may be interpreted as having a title of 'Plug' with 'For Omnifocus' being placed in the location field of your event. This is because the calendar interprets anything after 'in' to represent the location of your event. For more information, see here: 

https://github.com/feraleyebrows/tasks2cal/issues/1


### Start and End Date

Your settings will be saved every time you run the plugin. Dates will always default to tomorrow but the time window will stay the same. For example, if you loaded the plugin for the first time on the 1st January 2023, the default selected dates would be as follows:

**Start Date: 2nd January 2023 09:00**

**End Date: 2nd January 2023 17:00**

You may then adjust those times to match your desired time window. For example:

**Start Date: 2nd January 2023 10:00**

**End Date: 2nd January 2023 16:00**

If you then loaded the plugin again the next day on the 2nd January 2023, the default selections will be:

**Start Date: 3rd January 2023 10:00**

**End Date: 3rd January 2023 16:00**

### App

As far as Calendar applications go, you can currently choose between BusyCal and Fantastical as they support adding calendar events via app URL schemes. Apple Calendar does not offer this functionality directly as far as I'm aware. 

If you use BusyCal you will only be able to use the plugin on a Mac as BusyCal currently has no URL handler on iOS. The plugin works for Fantastical on both MacOS and iOS. 

You can also select Tim. This allows you to add tasks to Tim without sending them to any calendar.

### Also add tasks to Tim

Checking this box will send your tasks to Tim as well as the calendar app you have selected in the App field. If you have selected Tim in the app field it will do nothing.

### Add as tasks (Not Events)

This will add your tasks as tasks rather than events into your calendar. There are however some drawbacks to this.

The first, is that neither BusyCal nor Fantastical will allow you to alter the duration of a task. All tasks will be added as 30 min blocks in the Calendar view. This means that short tasks will be overlapping each other and a long task will have a gap of empty time on the calendar after it. If you are adding your Omnifocus Tasks as Calendar Tasks it is therefore advisable to use List mode on BusyCal and the Tasks sidebar on Fantastical for viewing your day as it may otherwise be difficult to read.

The second disadvantage is that both Fantasical and BusyCal treat "Due Time" as "Task Start" whereas Omnifocus classes "Due Time" as "Deadline Time" or "Task End". This is because the Calendar apps are using Apple Reminders for their Task Management. In my opinion, this is problematic because a reminder is not a task, it is an alarm to do a task.

I gave thought to taking your Due Date from Omnifocus and subtracting the time estimate to get the task start time but thought better of it as you do not always (or preferably ever) want to be working on a task in the moments right before a deadline. Also you may be adding a long task that you may be working on across several days and adding a time in this manner would not allow you to timeblock it on any other day other than deadline day. 

Becuase of this, due dates are effectively ignored and your Omnifocus tasks are added to your Calendar as tasks using the same time allocation method as if they had been added as events.

### Maximum Task Depth

Selects a maximum depth of task to be chosen. Only used if you specify the `Lowest task at max depth` option in the `Only Include` menu (see below). Top level is classed as level 0. For example:

```
Exercise Project
- Level 0: Warm Up
	- Level 1: Yoga
- Level 0: Cardio
	- Level 1: Run
		- Level 2: 5km @ Race Pace
```

### Only Include

Filters tasks to match preference. Using the following example:

```
Exercise Project
- Warm Up
	- Yoga
- Cardio
	- Run
		- 5km @ Race Pace
```

If you selected `Tasks with no children.` then `Yoga` and `5km @ Race Pace` will be added to you calendar. 

If you select `Lowest task at max depth` then what is added will depend on the depth you have specified in the Max Depth Field (see above). Top level is considered level 0. Using the above example:

If you selected 0 as your max depth then `Warm Up` and `Cardio` will be added.

If you selected 1 as your max depth then `Yoga` and `Run` will be added.

If you selected 2 as your max depth then `Yoga` and `5km @ Race Pace` will be added.

If you select `All` then `Warm Up`, `Yoga`, `Cardio`, `Run` and `5km @ Race Pace` will all be added to your calendar in some form. This is probably of limited use in most workflows, but may come in handy if on the `Unestimated Tasks Should Be` menu you have selected the `Added as unscheduled tasks` option (see below for more details).

### Default Duration

This is how long a calendar event will last for if you have not specified a time estimate on it within Omnifocus. The value should be an integer number that represents the minutes you want to spend on the task.

### Unestimated Tasks Should Be

Determines how Omnifocus tasks with no time estimates should be handled. There are three options:

#### Added as events with the default duration

You tasks will be timeblocked in the calendar using the duration set in the default duration field. For example, if you have a task 'Take out trash', a default duration of 30m, and a start date of 09:00 the following event will be added:

"Take out trash 09:00 - 09:30"

#### Added as unscheduled tasks

In the above example, you may have noticed that assigning 30 minutes to take out the trash is a tad excessive. You could set a small default duration, say 5 minutes, for unscheduled tasks. But if you have lots of these tasks, your calendar starts to become pretty messy. Across both Fantastical and BusyCal, when dragging a calendar event to resize it you are only really offered the option of resizing it in 15 minute intervals, and events tend to snap to one of the :00, :15, :30 or :45 minute lines. For these reasons, you may prefer to add any trivial tasks to your calendars Task section to check off whenever you have a spare minute rather than scheduling them as an event. This setting will allow you to do that.

#### Ignore

All unestimated tasks will not be added to the calendar, either as events or as tasks.

### If Total Task Duration Exceeds Time.

This option allows you to specify what the plug in should do if you have selected tasks that have exceeded the allocated time window. For example, suppose you have selected the following dates:

**Start Date: 1st January 2023 09:00**

**End Date: 1st January 2023 10:00**

**Default Duration: 30 mins**

You therefore have a 1 hour window (60 minutes) of total time available for your selected tasks.

Now suppose you have selected the following tasks:

- Work out. Estimate: 60 mins.
- Shower. No Estimate.
- Eat breakfast. Estimate: 10 mins.

This is how they will play out depending on the option you choose:

#### Stop Adding Tasks When End Date Reached
```
- 09:00 to 10:00 Work Out
```

No other events will be added as all available time has been used.

#### Squash Task Durations To Fit Window
```
- 09:00 to 09:25 Work Out
- 09:25 to 09:50 Shower
- 09:50 to 10:00 Eat breakfast
```

The average time available for all all tasks is 20 minutes (60 minutes / 3 tasks).

Any tasks longer than the average will be truncated. Any tasks shorter will be unaffected.

Short tasks are subtracted from the total time.

60 minutes total - 10 minutes (eat breakfast) = 50 minutes remaining.

In this case only 'Eat Breakfast. 10 minutes' is a shorter than the average task time (20 minutes) as "Shower" has no estimate in omnifocus so it falls back to the default task duration which has been set to 30 minutes.

The remaining time is then divided by the average amount of tasks remaining:

50 minutes / 2 tasks = 25 minutes

And this is the time assigned to all tasks longer than the average (Work out, shower).

#### Continue adding tasks past end date
```
- 09:00 to 10:00 Work Out
- 10:00 to 10:30 Shower
- 10:30 to 10:45 Eat breakfast
```

This is pretty self explanatory. The end date is ignored entirely and tasks are added regardless.



