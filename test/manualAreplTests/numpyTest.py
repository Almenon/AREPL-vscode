import numpy as np
arr = np.array([str(i) for i in range(3)], dtype=np.object)
dtype = arr.dtype
shape = arr.shape
buf = arr.tobytes()
# del arr
# arr = np.ndarray(buffer=buf, dtype=dtype, shape=shape).copy()
# above code if uncommented causes segfault
# not sure why jsonpickle v1 should handle it
# also AREPL should be able to gracefully inform user process crashed
# but currently AREPL just silently dies :/

""" EXPECTED RESULT:
-{
    arr: -{
        py/object: "numpy.ndarray",
        dtype: "object",
        values: -[
            "0",
            "1",
            "2"
        ]
    },
    buf: -{
        py/b64: "SEGN/XkCAAAoQo39eQIAACBEjf15AgAA\n"
    },
    dtype: -{
        py/object: "numpy.dtype",
        dtype: "object"
    },
    shape: -{
        py/tuple: +[1 items]
    }
}
"""
