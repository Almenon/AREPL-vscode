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
