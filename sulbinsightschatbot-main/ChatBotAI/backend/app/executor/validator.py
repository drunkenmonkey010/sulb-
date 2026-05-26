import ast
import logging

logger = logging.getLogger(__name__)

ALLOWED_MODULES = {
    # Safe Python built-in modules
    "math",
    "random",
    "datetime",
    "calendar",
    "json",
    "csv",
    "collections",
    "itertools",
    "functools",
    "operator",
    "string",
    "re",

    # Third-party modules installed in Docker
    "pandas",
    "numpy",
    "plotly",
    "matplotlib",
    "jsonschema",
    "dateutil",  # python-dateutil
    "pytz"
}

SAFE_BUILTINS =  {
  
    "print": print,
    "len": len,
    "range": range,
    "dict": dict,
    "list": list,
    "tuple": tuple,
    "set": set,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "abs": abs,
    "max": max,
    "min": min,
    "sum": sum,
    "round": round,
    "zip": zip,
    "enumerate": enumerate,
    "isinstance": isinstance,
    "issubclass": issubclass,
    "type": type,
    "None": None,
    "True": True,
    "False": False
}
SAFE_BUILTIN_NAMES = set(SAFE_BUILTINS.keys())

class HardenedSecurityVisitor(ast.NodeVisitor):
    """
    AST-based security validator.
    Blocks dangerous imports, function calls,
    dunder access, and unsafe Python constructs.

    """

    def __init__(self):
        super().__init__()
        self.user_defined_funcs = set()

    def visit_FunctionDef(self, node):
        # Keep track of user-defined functions
        self.user_defined_funcs.add(node.name)
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id not in SAFE_BUILTIN_NAMES and node.func.id not in self.user_defined_funcs:
                logger.warning(f"Blocked function call: {node.func.id}")
                raise ValueError(f"Call to '{node.func.id}' not allowed")
        if isinstance(node.func, ast.Attribute):
            if node.func.attr.startswith("__"):
                logger.warning("Blocked dunder attribute call")
                raise ValueError("Dunder attribute access not allowed")
        self.generic_visit(node)

    def visit_Import(self, node):
        for alias in node.names:
            root = alias.name.split(".")[0]
            if root not in ALLOWED_MODULES:
                logger.warning(f"Blocked import attempt: {root}")
                raise ValueError(f"Import of '{root}' not allowed")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            root = node.module.split(".")[0]
            if root not in ALLOWED_MODULES:
                logger.warning(f"Blocked import-from attempt: {root}")
                raise ValueError(f"Import from '{root}' not allowed")
        self.generic_visit(node)

   

    def visit_Attribute(self, node):
        if node.attr.startswith("__"):
            logger.warning("Blocked dunder attribute access")
            raise ValueError("Dunder attributes not allowed")
        self.generic_visit(node)

    def visit_Name(self, node):
        if node.id.startswith("__"):
            logger.warning("Blocked dunder name usage")
            raise ValueError("Dunder names not allowed")

    def visit_Global(self, node):
        logger.warning("Blocked global keyword usage")
        raise ValueError("Global keyword not allowed")

    def visit_Nonlocal(self, node):
        logger.warning("Blocked nonlocal keyword usage")
        raise ValueError("Nonlocal keyword not allowed")

    # def visit_Lambda(self, node):
    #     logger.warning("Blocked lambda usage")
    #     raise ValueError("Lambda not allowed")


def validate_code(code: str):
    """
    Validates untrusted Python code using AST inspection.
    Raises ValueError if unsafe constructs are detected.
    """

    try:
        logger.info("Starting AST validation")

        tree = ast.parse(code)
        HardenedSecurityVisitor().visit(tree)

        logger.info("AST validation passed")

    except SyntaxError as e:
        logger.warning(f"Syntax error detected: {str(e)}")
        raise ValueError(f"Syntax Error: {str(e)}")

    except ValueError:
        # Already logged inside visitor
        raise

    except Exception as e:
        logger.exception("Unexpected error during validation")
        raise ValueError("Validation failed due to internal error")