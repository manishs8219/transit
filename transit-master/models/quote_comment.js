/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('quote_comment', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		post_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		quote_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0,
		},
		quote_comment: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		senderId: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		receiverId: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: false
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
		tableName: 'quote_comment'
	});
};
