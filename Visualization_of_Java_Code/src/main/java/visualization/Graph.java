package visualization;

import com.mxgraph.layout.hierarchical.mxHierarchicalLayout;
import com.mxgraph.layout.mxIGraphLayout;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.view.mxGraph;

import javax.swing.*;
import java.awt.*;

public class Graph {
    public static void test() {
        Object v1;
        Object v2;
        Object v3;
        JFrame f = new JFrame();
        f.setSize(500, 500);
        f.setLocation(300, 200);

        mxGraph graph = new mxGraph();
        mxGraphComponent graphComponent = new mxGraphComponent(graph);
        f.getContentPane().add(BorderLayout.CENTER, graphComponent);
        f.setVisible(true);

        Object parent = graph.getDefaultParent();
        graph.getModel().beginUpdate();
        try {
            v1 = graph.insertVertex(parent, null, "node1", 100, 100, 80, 30);
            v2 = graph.insertVertex(parent, null, "node2", 100, 100, 80, 30);
            v3 = graph.insertVertex(parent, null, "node3", 100, 100, 80, 30);

            graph.insertEdge(parent, null, "Edge", v1, v2);
            graph.insertEdge(parent, null, "Edge", v2, v3);

        } finally {
            graph.getModel().endUpdate();
        }

        // define layout
        mxIGraphLayout layout = new mxHierarchicalLayout(graph);

        // layout using morphing
        graph.getModel().beginUpdate();
        try {
            layout.execute(graph.getDefaultParent());
        } finally {
            graph.getModel().endUpdate();
            // fitViewport();
        }

    }

    public static void main(String[] args) {
        test();
    }
}
