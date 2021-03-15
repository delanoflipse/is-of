const SUB_TYPES = ['array', 'object'];
// const ALLOWED_TYPES = /^(string|number|boolean|object|function)$/;

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js :182
function getType(fn: (() => any) | null): string {
  if (fn == null) {
    return 'null';
  }

  const match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1].toLowerCase() : "";
}

function Schema(types: string[], keys: string[]) {
  this.types = types;
  this.subschemas = [];
}

const validators = {
  'string': (value) => toString.call(value) === '[object String]',
  'number': (value) => Number.isFinite(value),
  'boolean': (value) => value === true || value === false || toString.call(value) === '[object Boolean]',
  'object': (value) => Object(value) === value,
  'function': (value) => toString.call(value) === '[object Function]' || typeof value === 'function',
  'array': Array.isArray || ((value) => toString.call(value) === '[object Array]'),
  'null': ((value) => value === null),
};

Schema.prototype.key = function(key: string, schema: typeof Schema) {
  if (key == '*') {
    this.subschemas.push([key, schema]);
  } else {
    this.subschemas.unshift([key, schema]);
  }

  return this;
}

Schema.prototype.validate = function(instance: any, throwErrors = false, _keys: string[] = []) {
  const keys = _keys.length == 0 ? ['$']: _keys;
  const name = keys.join('.');

  const [valid, sub] = this.types.reduce(([isValid, hasSub], type) => {
    const valid = validators[type](instance);
    const sub = valid && SUB_TYPES.indexOf(type) > -1;
    return [valid || isValid, sub || hasSub];
  }, [false, false]);

  if (!valid) {
    const error = new Error(`${name} is not of type [${this.types.join(' | ')}]`);
    if (throwErrors) {
      throw error;
    }

    return [false, [error]];
  }

  if (sub) {
    const keyset = [];
    for (const sid in this.subschemas) {
      const [keyname, subschema] = this.subschemas[sid];

      const tocheck = [];

      if (keyname == '*') {
        const fkeys = Object.keys(instance).filter(x => keyset.indexOf(x) == -1);
        tocheck.push(...fkeys);
      } else {
        tocheck.push(keyname);
      }

      for (const key of tocheck) {
        const [valid, errors] = subschema.validate(instance[key], throwErrors, [...keys, key]);
        if (!valid) {
          return [false, errors];
        }
        keyset.push(key);
      }
    }
  }

  return [true, []];
}

export function is(types: any): typeof Schema {
  if (validators.array(types)) {
    const tps: Array<null | (() => any)> = types;
    const mapped = tps.map(getType);
    return new Schema(mapped, ['$']);
  } else {
    const type = getType(types);
    return new Schema([type], ['$']);
  }
}