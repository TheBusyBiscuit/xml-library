const FileSystem = require('fs');
const fs = FileSystem.promises;
const path = require("path");

const chai = require('chai');
chai.use(require('chai-as-promised'));
const {assert} = chai;

const XML = require('../lib/XML.js');
const {XMLNode} = XML;

var xmlString = FileSystem.readFileSync(path.resolve(__dirname, "../test/example.xml"), "UTF8").replace(/\t/g, "  ");
var jsonString = FileSystem.readFileSync(path.resolve(__dirname, "../test/example.json"), "UTF8").replace(/\r?\n|\r/g, "");

describe("Functionality Test", () => {
    var node;

    it("can read XML", async () => {
        node = await XML.promises.fromXML(xmlString);
        return assert.equal(JSON.stringify(node), jsonString);
    });

    it("can write XML (no options)", async () => {
        var str = await XML.promises.toXML(node);
        return assert.equal(str, xmlString);
    });

    it("can write XML (empty options)", async () => {
        var str = await XML.promises.toXML(node, {});
        return assert.equal(str, xmlString);
    });

    it("will reject invalid XML", async () => {
        return assert.isRejected(XML.promises.fromXML("This should definitely be invalid"));
    });

    it("will reject converting non-XML Nodes to XML", async () => {
        return assert.isRejected(XML.promises.toXML("This should definitely be invalid"));
    });
})

describe("XMLNode Class Test", () => {
    describe("Constructor", () => {
        it("can successfully create Nodes (With Value)", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            return Promise.all([
                assert(node instanceof XMLNode),
                assert(node.getValue() === "Lorem Ipsum")
            ]);
        });

        it("will throw an Error when specifying invalid Names in the constructor", () => {
            return assert.throws(() => {
                new XMLNode(42);
            });
        });

        it("can successfully specify Attributes", () => {
            var node = new XMLNode("Test", {
                cool: "true"
            }, "Derp");

            return assert(node.getAttribute("cool") === "true");
        });

        it("can successfully specify Children", () => {
            var node = new XMLNode("Test", null, {
                "test[0]": new XMLNode("test", "World")
            }, "Derp");

            return Promise.all([
                assert(node.getChild("test") instanceof XMLNode),
                assert(node.getChild("test").getValue() === "World")
            ]);
        });
    })

    describe("Values", () => {
        it("can successfully create Nodes (Without Value)", () => {
            return assert(new XMLNode("Test") instanceof XMLNode);
        });

        it("can successfully set Node Values", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setValue("Dolor sit amet.");

            return assert(node.getValue() === "Dolor sit amet.");
        });

        it("can successfully delete Node Values", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setValue(null);

            return assert(!node.getValue());
        });

        it("will throw an Error if Value is not valid", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.setValue(42);
            })
        });
    });

    describe("Attributes", () => {
        it("can successfully set Node Attributes", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setAttribute("hello", "world");

            return assert(node.getAttribute("hello") === "world");
        });

        it("will throw an Error if Attribute Key is not valid", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.setAttribute(42);
            })
        });

        it("will throw an Error if Attribute Value is not valid", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.setAttribute("hello", 42);
            })
        });

        it("can delete an Attribute", () => {
            var node = new XMLNode("Test", {
                hello: "world"
            });

            node.setAttribute("hello", null);

            return assert(!node.getAttribute("hello"));
        });
    });

    describe("Children", () => {
        it("can successfully set a Child (no index)", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setChild("hello", new XMLNode("world"));

            return assert(node.getChild("hello") instanceof XMLNode);
        });
        it("can successfully set a Child (index)", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setChild("hello[0]", new XMLNode("world"));

            return assert(node.getChild("hello[0]") instanceof XMLNode);
        });

        it("can successfully add a second Child", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.setChild("hello", new XMLNode("hello", "world"));
            node.addChild(new XMLNode("hello", "derp"));

            return Promise.all([
                assert(node.getChild("hello[1]") instanceof XMLNode),
                assert(node.getChild("hello[1]").getValue() === "derp")
            ]);
        });

        it("can successfully add multiple Children at once", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            node.addChild([
                new XMLNode("hello", "world"),
                new XMLNode("hello", "derp")
            ]);

            return Promise.all([
                assert(node.getChild("hello[1]") instanceof XMLNode),
                assert(node.getChild("hello[1]").getValue() === "derp")
            ]);
        });

        it("can successfully get multiple Children at once", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");
            var child = new XMLNode("Test", "Lorem Ipsum");
            var grandchild = new XMLNode("Grand", "Child");

            node.addChild(child);
            child.addChild(grandchild);

            return Promise.all([
                assert(node.getChild(["Test", "Grand"]) instanceof XMLNode),
                assert(node.getChild(["Test", "Grand"]).getValue() === "Child")
            ]);
        });

        it("will throw an Error if path is not of Type String", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.getChild(42);
            });
        });

        it("will throw an Error if Child is not of Type XMLNode (addChild)", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.addChild("hello", "world");
            });
        });

        it("will throw an Error if Child is not of Type XMLNode (setChild)", () => {
            var node = new XMLNode("Test", "Lorem Ipsum");

            return assert.throws(() => {
                node.setChild("hello", "world");
            });
        });
    });
});
