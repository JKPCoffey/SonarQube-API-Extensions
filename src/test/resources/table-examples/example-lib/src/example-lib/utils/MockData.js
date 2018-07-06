/*global define*/
define(function () {
    'use strict';

    var lastId = 0,
        firstNames = [
            'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
            'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward', 'Brian', 'Ronald', 'Anthony', 'Jason', 'Matthew',
            'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric', 'Stephen', 'Andrew', 'Raymond',

            'Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Nancy', 'Karen',
            'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Jessica',
            'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy', 'Anna', 'Rebecca', 'Virginia'
        ],
        lastNames = [
            'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
            'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker',
            'Hall', 'Allen', 'Young', 'Hernandez', 'Levis'
        ],
        roles = [
            'Administrator Role: Permits unrestricted access to all ENM applications and commands within these applications, excluding Security applications.',
            'ENodeB_Application_Administrator: Provides full control over ENodeB specific fragments of Managed Element model, including TN, FM, LM, PM, Log and parts of equipment',
            'Field Technician: Permits limited access to the ENM system. Allows basic user self-management operations and obtaining certificates for accessing nodes'
        ]
        ;

    function randInt(limit) {
        limit = limit || 100;
        return Math.round(Math.random() * 1000) % limit;
    }

    return {
        generate: function (options) {
            options = options || {};

            var attributes = Object.keys(options.attributes),
                rowCount = options.rows || 50,
                columnCount = attributes.length,
                text = options.text !== undefined ? ' : ' + options.text : '',
                prefix = options.prefix !== undefined ? options.prefix + ' ' : '',
                columnShortLabel = 'Col',
                rowShortLabel = 'Row',
                data = [],
                colTypes = attributes.map(function (attr) {
                    return options.attributes[attr];
                })
                ;

            if (attributes.length === 0) {
                // no keys provided, need to generate random ones
                for (var col = 0; col < columnCount; col++) {
                    attributes.push(columnShortLabel.toLowerCase() + '_' + col);
                }
            }

            for (var rowPosition = 0; rowPosition < rowCount; rowPosition++) {
                var model = {};

                for (var colPosition = 0; colPosition < columnCount; colPosition++) {
                    var key = attributes[colPosition],
                        value;

                    var firstName = firstNames[rowPosition % firstNames.length];
                    var lastName = lastNames[rowPosition % lastNames.length];

                    switch (colTypes[colPosition]) {
                        case 'id':
                            value = lastId++;
                            break;
                        case 'date':
                            value = new Date(2000, rowPosition, randInt(30), randInt(24), randInt(60)).getTime();
                            break;
                        case 'role':
                            value = roles[randInt(roles.length)];
                            break;
                        case 'boolean':
                            value = randInt() % 2 === 0;
                            break;
                        case 'randomInt':
                            value = randInt();
                            break;
                        case 'firstName':
                            value = firstName;
                            break;
                        case 'lastName':
                            value = lastName;
                            break;
                        case 'email':
                            value = (firstName + '.' + lastName).toLocaleLowerCase() + '@ericsson.com';
                            break;
                        case 'signum':
                            value = (firstName.substr(0, 4) + lastName.substr(0, 4)).toLocaleLowerCase();
                            break;
                        case 'short-lorem':
                            value = rowPosition + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
                            break;
                        case 'lorem':
                            value = rowPosition + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
                                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
                                'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
                                'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';
                            break;
                        default :
                            value = prefix + rowShortLabel + ' ' + rowPosition + ' ' + columnShortLabel + ' ' + colPosition + text;
                    }

                    model[key] = value;
                }

                data.push(model);
            }

            return data;
        }
    };
});
