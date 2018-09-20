###########################################
#                Code
###########################################
import re
import datetime

search = re.compile("(d)(?P<yo>o)f(g)").search("ffdofg")
now = datetime.datetime.now()

###########################################
#                Expected Result
###########################################
"""
-{
    now: -{
        date/time: "2018-06-09 14:10:02.908383"
    },
    search: -{
        py/object: "_sre.SRE_Match",
        match: "dofg",
        groups: +[3 items],
        span: +[2 items]
    }
}
"""
