/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('push_notifications', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
	
		sender_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		recevier_Id	: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		notification_type: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '1'
		},
		read_unread: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1'
		},
		comment: {
			type: DataTypes.STRING(255),
			allowNull: true,
			
		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'push_notifications'
	});
};
