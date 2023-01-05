function getAssociationStyles(type) {
    switch (type) {
        case 'extends':
            return {
                color: 'green',
                rx: 8,
                ry: 8
            }
        case 'implements':
            return {
                color: 'blue',
                rx: 10,
                ry: 10
            };
        case 'returnType':
            return {
                color: 'red',
                rx: 15,
                ry: 15
            };
        case 'invocation':
            return {
                color: 'yellow',
                rx: 20,
                ry: 20
            };
        case 'access':
            return {
                color: 'violet',
                rx: 30,
                ry: 8
            };
    }
}
export default getAssociationStyles