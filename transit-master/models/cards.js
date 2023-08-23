/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('cards', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		is_default	: {
			type: DataTypes.INTEGER(11),
			allowNull: null,
			defaultValue:0
		},
		cardNumber: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		holderName: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		year: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		month: {
			type: DataTypes.STRING(255),
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
		tableName: 'cards'
	});
};
