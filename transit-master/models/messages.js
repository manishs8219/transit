/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('messages', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		chatConstantId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		groupId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		lat: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue:'0'
		},
		lng: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue:'0'
		},
		replyMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		replyMessageOwnerId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		replyMessage: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue:'0'
		},
		replyMessageType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:'0'
		},
		forwadedMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		readStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		messageType: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		caption: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:'0'
		},
		thumbnail: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue:""

		},
		isBroadcast: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			defaultValue: '0'
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:'0'
		},
		created: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updated: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
	}, {
		tableName: 'messages'
	});
};
