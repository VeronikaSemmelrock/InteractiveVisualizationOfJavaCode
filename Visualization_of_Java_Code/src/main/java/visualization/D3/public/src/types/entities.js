function getEntityStyles(type) {
    switch (type) {
        case 'package':
            return {
                color: 'green',
                rx: 8,
                ry: 8
            }
        case 'class':
            return {
                color: 'blue',
                rx: 10,
                ry: 10
            };
        case 'method':
            return {
                color: 'red',
                rx: 15,
                ry: 15
            };
        case 'constructor':
            return {
                color: 'yellow',
                rx: 20,
                ry: 20
            };
        case 'attribute':
            return {
                color: 'violet',
                rx: 30,
                ry: 8
            };
        case 'parameter':
            return {
                color: 'orange',
                rx: 8,
                ry: 30
            };
        case 'localVar':
            return {
                color: 'turquoise',
                rx: 0,
                ry: 0
            };
    }
}
export default getEntityStyles