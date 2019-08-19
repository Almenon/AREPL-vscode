###########################################
#                Code
###########################################
import re
import datetime
import decimal

search = re.compile("(d)(?P<yo>o)f(g)").search("ffdofg")
now = datetime.datetime.now()
d = decimal.Decimal('1.55')

###########################################
#                Expected Result
###########################################
"""
-{
    d: 1.55,
    now: -{
        date/time: "2019-08-18 18:21:30.763471"
    },
    search: -{
        py/object: "_sre.SRE_Match",
        match: "dofg",
        groups: +[3 items],
        span: +[2 items]
    }
}
0 ms
"""

