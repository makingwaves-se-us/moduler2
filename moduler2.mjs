let path = {};

export const moduler2 = function (settings) {
  path = settings.path;

  loadModules(settings.element || document.body);
  detectDomChanges();
};

const loadModules = (node) => {
  const elements = node.querySelectorAll("[data-module]");

  // Iterate all nodes with a data-module attribute
  for (let element of elements) {
    let names = element.getAttribute("data-module").split(" ");

    // Iterate all module names in current data-module attribute
    for (let name of names) {
      addModuleToElement(name, element);
    }
  }
};

const addModuleToElement = (name, element) => {
  // Abort if module is already initialized on the element
  if (element._modules && element._modules[name]) {
    return;
  }

  // Dynamicly import module
  import(path + name + ".js")
    .then((Module) => {
      if (Module) {
        // Add empty object to element property with module name as the key
        element._modules
          ? (element._modules[name] = {})
          : (element._modules = { [name]: {} });

        // Create module
        element._modules[name] = new Module[toPascalCase(name)](
          parseData(element.getAttribute("data-" + name))
        );
        element._modules[name].element = element;
        element._modules[name].init();
      }
    })
    .catch(console.error);
};

const removeModuleFromElement = (name, element) => {
  // Make sure module is loaded on element
  if (element._modules[name]) {
    // Run destroy method to remove stuff like attached events
    if (element._modules[name].destroy) {
      element._modules[name].destroy();
    }

    // Remove module name from element module-attribute
    if (element.getAttribute("module")) {
      element.setAttribute(
        "module",
        element.getAttribute("module").replace(name, "")
      );
    }

    // Remove module-named object from element object
    delete element._modules[name];
  }
};

const detectDomChanges = () => {
  // Callback function to execute when mutations are observed
  const callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      // Node is added to DOM
      if (mutation.addedNodes.length) {
        // Look for new modules
        for (let node of mutation.addedNodes) {
          loadModules(node);
        }
      }

      // Node is removed from DOM
      if (mutation.removedNodes.length) {
        for (let node of mutation.removedNodes) {
          // If element had modules attached to it
          if (node.getAttribute("data-module").length) {
            for (let name in node.modules) {
              removeModuleFromElement(name, node);
            }
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document.body, { childList: true });
};

const parseData = (data) => {
  if (!data) {
    return {};
  } else if (data[0] === "{") {
    // Is using JSON syntax
    // Replace single-quote character with double quotes
    return JSON.parse(data.replace(/'/g, '"'));
  } else {
    // Wrap all property names with quotes and replace single-quote character with double quotes
    return JSON.parse(
      "{" +
        data
          .replace(
            /([\w\-$]+):(?:|\s|\d|false|true|null|undefined|\{|\[|\"|\')/gi,
            '"$1":'
          )
          .replace(/'/g, '"') +
        "}"
    );
  }
};

const toPascalCase = (value) =>
  value.replace(/(?:^|[\s-])(\w)/g, (matches, letter) => letter.toUpperCase());
