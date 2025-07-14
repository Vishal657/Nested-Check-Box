import { useRef, useState } from "react";
import "./styles.css";

const data = [
  {
    name: "1",
    id: 1,
    chidren: [
      {
        name: "!",
        id: 2,
        chidren: [
          {
            name: "a",
            id: 3,
          },
          {
            name: "b",
            id: 4,
          },
        ],
      },
      {
        name: "!!",
        id: 5,
        chidren: [
          {
            name: "b",
            id: 7,
            chidren: [
              {
                name: "©",
                id: 8,
              },
              {
                name: "˜",
                id: 9,
              },
            ],
          },
          {
            name: "c",
            id: 10,
            chidren: [
              {
                name: "√",
                id: 11,
              },
              {
                name: "†",
                id: 12,
              },
            ],
          },
        ],
      },
    ],
  },
];

const Node = ({ name, pad, onChange, checked }) => {
  return (
    <div style={{ paddingLeft: pad + "px" }}>
      <input
        type={"checkbox"}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{name}</span>
    </div>
  );
};

export default function App() {
  const parants = useRef({});
  const [checkedIds, setCheckedIds] = useState({});

  const onChange = (checked, node) => {
    const childrens = getChildrenIds(node);
    setCheckedIds((prev) => {
      const newPrev = { ...prev };
      newPrev[node.id] = checked; // marking current node as checked or unchecked
      // Propogating the effect to the children
      for (let childId of childrens) {
        newPrev[childId] = checked;
      }

      // If node was unchecked then mark all the parants as unchecked
      if (!checked) {
        let parantNode = parants.current[node.id];
        while (parantNode) {
          newPrev[parantNode.id] = false;
          parantNode = parants.current[parantNode.id];
        }
        return newPrev;
      }

      // if node was checked then check the maximum parant that will get checked
      if (checked) {
        let maxParantToCheck = node;
        while (
          parants.current[maxParantToCheck.id] &&
          childrenChecked(parants.current[maxParantToCheck.id], newPrev)
        ) {
          maxParantToCheck = parants.current[maxParantToCheck.id];
          // so that next time the parant gets all its children as checked
          newPrev[maxParantToCheck.id] = true;
        }
        return newPrev;
      }

      return newPrev;
    });
  };

  const childrenChecked = (node, checkedNodes) => {
    const children = node.chidren?.map((n) => n.id) ?? [];
    for (let child of children) {
      if (!checkedNodes[child] && child != node.id) {
        return false;
      }
    }
    return true;
  };

  const getChildrenIds = (node) => {
    let ids = [node.id];
    for (let child of node.chidren ?? []) {
      const chidrenIds = getChildrenIds(child);
      ids = [...ids, ...chidrenIds];
    }
    return ids;
  };

  const getChildrenNodes = (node, pad, parant) => {
    let elementTree = [];
    if (node?.id) {
      // Storing parant
      parants.current[node?.id] = parant;
    }
    elementTree.push(
      <Node
        name={node.name}
        key={node.id}
        pad={pad}
        onChange={(checked) => onChange(checked, node)}
        checked={checkedIds[node.id]}
      />
    );
    for (let child of node.chidren ?? []) {
      const childrenElements = getChildrenNodes(child, pad + 10, node);
      elementTree = [...elementTree, ...childrenElements];
    }
    return elementTree;
  };

  const renderCheckBoxes = () => {
    let elements = [];
    for (let ch of data) {
      const elementTree = getChildrenNodes(ch, 0);
      elements = [...elements, ...elementTree];
    }
    return elements;
  };

  return <div className="App">{renderCheckBoxes()}</div>;
}
