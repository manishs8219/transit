/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('chatConstants', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		lastMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		typing: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:'0'
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:'0'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'chatConstants'
	});
};
