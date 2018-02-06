module.exports.parseXML = function(xml, callback) {
    let i = 0, level = 0;
    let json = {};
    let objects = [];

    let doc = xml
    .replace(/(\r?\n|\r)|(<\?.*\?>)|(<!--.*-->)/g, "")
    .replace(/\t/g, " ")
    .replace(/\/>/g, "></>");

    while (i < doc.length) {
        if (doc.charAt(i) === "<") {
            let node = "";
            i++;

            while (doc.charAt(i) !== " " && doc.charAt(i) !== ">" && i < doc.length) {
                node += doc.charAt(i);
                i++;
            }

            if (node.charAt(0) === "/") {
                level--;
            }
            else {
                level++;

                let obj = new XMLNode(node);
                obj.level = level;

                while (doc.charAt(i) === " ") {
                    while (doc.charAt(i) === " ") {
                        i++;
                    }

                    let attribute = "";

                    while (doc.charAt(i - 1) !== "=" && i < doc.length) {
                        attribute += doc.charAt(i);
                        i++;
                    }
                    i++;

                    while (!(doc.charAt(i) === "\"" && doc.charAt(i - 1) !== "\\") && i < doc.length) {
                        attribute += doc.charAt(i);
                        i++;
                    }
                    i++;

                    let attr = attribute.split("=");
                    obj.setAttribute(attr[0], attr[1]);
                }

                let content = "";
                i++;

                if (doc.charAt(i) === "\"") {
                    i++;
                    while (!(doc.charAt(i) === "\"" && doc.charAt(i - 1) !== "\\") && i < doc.length) {
                        content += doc.charAt(i);
                        i++;
                    }
                }
                else {
                    while (doc.charAt(i) !== "<" && i < doc.length) {
                        content += doc.charAt(i);
                        i++;
                    }
                    i--;
                }

                if (!/^\s*$/.test(content)) {
                    obj.setValue(content);
                }

                objects.push(obj);
            }
        }

        i++;
    }

    json = objects[0];

    let n = 1;
    let hierarchy = [json];

    while (n < objects.length) {
        let obj = objects[n];
        let parent = hierarchy[hierarchy.length - 1];

        if (obj.level <= parent.level) {
            for (let x = -1; x < parent.level - obj.level; x++) {
                hierarchy.splice(hierarchy.length - 1, 1);
            }

            parent = hierarchy[hierarchy.length - 1];
        }
        hierarchy.push(obj);
        parent.addChild(obj);

        n++;
    }

    for (let node in objects) {
        delete objects[node].level;
    }

    callback(null, json);
}

module.exports.parseJSON = function(json, callback) {
    if (!(json instanceof XMLNode)) {
        callback(new TypeError("'json' must be of type 'XMLNode'"), null);
        return;
    }

    let xml = "";
    let level = 0;

    addNode(json, function() {
        xml += "</" + json.name + ">\n";
    });

    function addNode(node, cb) {
        for (let x = 0; x < level * 2; x++) {
            xml += " ";
        }
        xml += "<" + node.name;

        for (let key in node.attributes) {
            xml += " " + key + "=\"" + node.attributes[key] + "\"";
        }
        xml += ">";

        if (node.hasOwnProperty("value")) {
            xml += node.value;
        }

        if (Object.keys(node.elements).length > 0) {
            xml += "\n";
        }

        for (let child in node.elements) {
            level++;
            addNode(node.elements[child], function() {
                if (Object.keys(node.elements[child].elements).length > 0) {
                    for (let x = 0; x < level * 2; x++) {
                        xml += " ";
                    }
                }

                level--;
                xml += "</" + node.elements[child].name + ">\n";
            });
        }

        cb();
    }

    callback(null, xml);
}

module.exports.XMLNode = XMLNode;

var XMLNode = class XMLNode {

    constructor(name, attributes, elements) {
        this.name = name;

        if (attributes instanceof Object) this.attributes = attributes;
        else this.attributes = {};

        if (elements instanceof Object) this.elements = elements;
        else this.elements = {};
    }

    addChild(node) {
        if (!(node instanceof XMLNode)) {
            throw new TypeError("'node' must be of type 'XMLNode'");
        }

        let index = 0;

        while(this.elements.hasOwnProperty(node.name + "[" + index + "]")) {
            index++;
        }

        this.elements[node.name + "[" + index + "]"] = node;
    }

    setChild(key, node) {
        if (!(node instanceof XMLNode)) {

            throw new TypeError("'node' must be of type 'XMLNode'");
        }

        let path = key;
        if (!/^.*\[[0-9]\]$/.test(path)) {
            path += "[0]";
        }

        this.elements[path] = node;
    }

    getChild(path) {
        if (path instanceof Array) {
            let node = this;
            for (var i in path) {
                node = node.getChild(path[i]);
            }

            return node;
        }
        else if (path instanceof String || typeof(path) === "string") {
            let key = path;
            if (!/^.*\[[0-9]\]$/.test(key)) {
                key += "[0]";
            }

            return this.elements[key];
        }
        else {
            console.log(path);
            throw new TypeError("'path' must be of type 'String' or 'Array (String)'");
        }
    }

    setAttribute(key, value) {
        if (value == null) {
            delete this.attributes[key];
        }
        else {
            this.attributes[key] = value;
        }
    }

    setValue(value) {
        if (value == null) {
            delete this.value;
        }
        else {
            this.value = value;
        }
    }

}
