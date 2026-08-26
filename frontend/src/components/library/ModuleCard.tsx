export default function ModuleCard({ module }) { return <div className=\
p-4
border
rounded\> <h3 className=\font-semibold\>{module.title}</h3> <p className=\text-sm
text-muted-foreground\>{module.description || \No
description\}</p> </div>; }
